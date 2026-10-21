# Data model

> Part of the Planzz product spec. Index: [../plan.md](../plan.md)


Every table carries `user_id` with RLS, and every cross-table foreign key includes `user_id`, so a row can never point at another user's axis, status or category even with a guessed UUID. Text search and unaccent setup are copied from Things.

**Structure: axes, statuses, categories, tasks**

```sql
-- extensions + f_unaccent(): same as Things
create extension if not exists pg_trgm with schema extensions;
create extension if not exists unaccent with schema extensions;
create extension if not exists pg_cron;
create extension if not exists pg_net;

create table profiles (
  user_id uuid primary key references auth.users on delete cascade,
  timezone text not null default 'UTC',          -- IANA, set from the browser on first load
  default_channels text[] not null default '{inapp,push}',
  auto_archive_days int not null default 14,
  created_at timestamptz not null default now()
);

create table axes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  name text not null,
  emoji text,
  color text not null,                   -- aurora token name
  canvas_viewport jsonb,                 -- {x, y, zoom}
  position text collate "C" not null,
  created_at timestamptz not null default now(),
  unique (id, user_id)
);

create table statuses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  name text not null,
  is_done boolean not null default false,
  position text collate "C" not null,
  unique (id, user_id)
);

create table categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  axis_id uuid not null,
  name text not null,
  color text,
  position text collate "C" not null,
  unique (id, axis_id, user_id),
  foreign key (axis_id, user_id) references axes (id, user_id) on delete cascade
);

create table goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  axis_id uuid not null,
  title text not null,
  description text,
  target_date date,
  progress_mode text not null default 'tasks' check (progress_mode in ('tasks','numeric')),
  current_value numeric, target_value numeric, unit text,
  achieved_at timestamptz, archived_at timestamptz,
  position text collate "C" not null,
  created_at timestamptz not null default now(),
  unique (id, axis_id, user_id),
  foreign key (axis_id, user_id) references axes (id, user_id) on delete cascade
);

create table tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  axis_id uuid not null,
  category_id uuid,                      -- null = Uncategorized
  status_id uuid not null,
  goal_id uuid,
  title text not null,
  notes text,                            -- markdown
  priority smallint not null default 0 check (priority between 0 and 3),
  due_date date,                         -- local date in profiles.timezone
  due_time time,                         -- null = all-day
  block_start timestamptz,               -- optional time block
  block_end timestamptz,
  position text collate "C" not null,    -- fractional index, one order for main + inner
  completed_at timestamptz,
  archived_at timestamptz,
  deleted_at timestamptz,
  gcal_event_id text,                    -- set by the Google outbox worker
  gcal_calendar_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  search tsvector generated always as (
    setweight(to_tsvector('simple', f_unaccent(coalesce(title,''))), 'A') ||
    setweight(to_tsvector('simple', f_unaccent(coalesce(notes,''))), 'C')
  ) stored,
  check (block_end is null or block_end > block_start),
  foreign key (axis_id, user_id) references axes (id, user_id) on delete restrict,
  foreign key (status_id, user_id) references statuses (id, user_id) on delete restrict,
  -- category must belong to the same axis; deleting a category only nulls category_id (PG15+)
  foreign key (category_id, axis_id, user_id) references categories (id, axis_id, user_id)
    on delete set null (category_id),
  foreign key (goal_id, axis_id, user_id) references goals (id, axis_id, user_id)
    on delete set null (goal_id)
);

create table subtasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  task_id uuid not null references tasks on delete cascade,
  title text not null,
  done boolean not null default false,
  position text collate "C" not null
);

create index tasks_board on tasks (user_id, axis_id, status_id, position)
  where deleted_at is null and archived_at is null;
create index tasks_due on tasks (user_id, due_date) where deleted_at is null and completed_at is null;
create index tasks_block on tasks (user_id, block_start) where block_start is not null;
create index tasks_search on tasks using gin (search);
create index tasks_title_trgm on tasks using gin (title extensions.gin_trgm_ops);
```

**Workspace content: resources, docs, canvas**

```sql
create table resources (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  axis_id uuid not null,
  category_id uuid,
  kind text not null check (kind in ('link','file','doc')),  -- Resources tab = link; Docs tab = file + doc
  title text,
  note text,
  body text,                             -- markdown, kind = 'doc' only
  url text, domain text, site_name text, favicon_url text, image_url text,
  file_path text,                        -- storage: {user_id}/{resource_id}/{file_name}
  file_name text, mime_type text, file_size bigint, thumbnail_path text,
  enrich_status text not null default 'pending' check (enrich_status in ('pending','done','failed')),
  position text collate "C" not null,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  search tsvector generated always as (
    setweight(to_tsvector('simple', f_unaccent(coalesce(title,'') || ' ' || coalesce(file_name,''))), 'A') ||
    setweight(to_tsvector('simple', f_unaccent(coalesce(note,'') || ' ' || coalesce(body,''))), 'C')
  ) stored,
  foreign key (axis_id, user_id) references axes (id, user_id) on delete cascade,
  foreign key (category_id, axis_id, user_id) references categories (id, axis_id, user_id)
    on delete set null (category_id)
);

create table task_resources (
  task_id uuid not null references tasks on delete cascade,
  resource_id uuid not null references resources on delete cascade,
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  primary key (task_id, resource_id)
);

create table canvas_nodes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  axis_id uuid not null,
  kind text not null check (kind in ('note','text','image','link','task_ref','resource_ref')),
  content jsonb not null default '{}',   -- text, color, image path, url...
  ref_id uuid,                           -- task or resource id for *_ref kinds
  x real not null, y real not null, w real not null, h real not null,
  z int not null default 0,
  updated_at timestamptz not null default now(),
  foreign key (axis_id, user_id) references axes (id, user_id) on delete cascade
);
-- save_canvas_layout(layout jsonb): same RPC as Things, targeting canvas_nodes
```

**Routines, reminders, notifications**

```sql
create table routines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  axis_id uuid references axes on delete set null,
  title text not null,
  weekdays smallint[] not null default '{1,2,3,4,5,6,7}',  -- ISO, 1 = Monday
  time_of_day time,                      -- shown in Today's timeline when set
  active boolean not null default true,
  position text collate "C" not null,
  created_at timestamptz not null default now()
);

create table routine_logs (
  routine_id uuid not null references routines on delete cascade,
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  local_date date not null,
  done_at timestamptz not null default now(),
  primary key (routine_id, local_date)
);

create table reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  purpose text not null default 'item' check (purpose in ('item','digest')),
  task_id uuid references tasks on delete cascade,
  routine_id uuid references routines on delete cascade,
  title text,                            -- standalone reminders
  kind text not null check (kind in ('once','daily')),
  fire_at timestamptz,                   -- kind = once, absolute
  offset_minutes int,                    -- kind = once, relative to the task's due (e.g. -60)
  time_of_day time,                      -- kind = daily
  weekdays smallint[] not null default '{1,2,3,4,5,6,7}',
  channels text[] not null default '{inapp,push}',
  next_fire_at timestamptz,              -- computed in TS (lib/schedule/next-fire.ts)
  locked_until timestamptz,
  last_fired_at timestamptz,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  check (channels <@ array['inapp','push','email'])
);
create index reminders_due on reminders (next_fire_at) where active;

create table push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  device_label text,
  created_at timestamptz not null default now(),
  last_ok_at timestamptz
);

create table notifications (                 -- in-app inbox + send log + idempotency
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  reminder_id uuid references reminders on delete set null,
  fire_slot timestamptz not null,            -- the next_fire_at that produced it
  title text not null,
  body text,
  url text,
  channels_sent text[] not null default '{}',
  read_at timestamptz,
  created_at timestamptz not null default now(),
  unique (reminder_id, fire_slot)
);

create table notification_actions (           -- one-time tokens for Done / Snooze from push or email
  token text primary key,                    -- 32 random bytes, base64url
  user_id uuid not null references auth.users on delete cascade,
  reminder_id uuid references reminders on delete cascade,
  task_id uuid references tasks on delete cascade,
  action text not null check (action in ('done','snooze_1h','snooze_tomorrow')),
  expires_at timestamptz not null,
  used_at timestamptz
);
-- consume_notification_action(token text): security definer RPC callable by anon;
-- validates expiry + used_at, applies the action for that user only, marks used. No service-role key in Next.
```

The daily email digest is a reminder row with `purpose = 'digest'`, `kind = 'daily'` and `channels = '{email}'`, so it rides the same dispatcher and respects the user's timezone.

**Google Calendar**

```sql
create table google_accounts (
  user_id uuid primary key references auth.users on delete cascade,
  google_email text not null,
  refresh_token_secret_id uuid not null,     -- vault.secrets id; never selectable by the client
  scopes text[] not null,
  status text not null default 'ok' check (status in ('ok','revoked','error')),
  connected_at timestamptz not null default now()
);

create table calendar_links (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  google_calendar_id text not null,
  axis_id uuid references axes on delete cascade,  -- null = show in global calendar only
  push boolean not null default false,             -- Planzz items written here
  show_events boolean not null default true,
  color text
);
create unique index one_push_calendar_per_axis on calendar_links (axis_id) where push;

create table gcal_outbox (
  id bigserial primary key,
  user_id uuid not null references auth.users on delete cascade,
  task_id uuid not null,
  op text not null check (op in ('upsert','delete')),
  attempts int not null default 0,
  last_error text,
  created_at timestamptz not null default now(),
  processed_at timestamptz
);
-- trigger on tasks: after insert/update of title, due_date, due_time, block_start, block_end,
-- axis_id, status_id, deleted_at -> enqueue 'upsert' (or 'delete' when deleted/undated)
-- only if the task's axis has a push calendar link.
```

**AI history**

```sql
create table ai_threads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  axis_id uuid references axes on delete set null,
  title text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table ai_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references ai_threads on delete cascade,
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  role text not null check (role in ('user','assistant','tool')),
  content jsonb not null,                    -- provider-neutral blocks incl. tool calls/results
  created_at timestamptz not null default now()
);
```

**RLS, storage, seeding**

- RLS on every table with the Things policy: `for all using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()))`. `google_accounts`: select only (no client writes); `notification_actions`: no client policies at all (RPC only).
- Storage: private bucket `planzz`, path `{user_id}/{resource_id}/{file}`, same `storage.foldername` policies as Things; signed URLs (1 h) batched per list.
- Guest quota trigger on `resources` (25 MB total, 10 MB per file for `is_anonymous` users), copied from Things.
- `handle_new_user()` trigger (security definer) on `auth.users` insert: creates the profile, axes Work / Study / Other (blue, violet, olive) and statuses To do / Doing / Waiting / Done (`is_done`).
- RPCs (security invoker): `search_all(q, lim)` over tasks + resources, `move_tasks(ids uuid[], axis_id, status_id, category_id, positions text[])` for multi-moves in one call, `goal_progress` view, `matrix_counts` view grouped by axis × status × category for headers.
- Dispatcher-only RPCs (called with the service role from `/api/cron/dispatch`): `claim_due_reminders(lim int)` sets `locked_until = now() + interval '2 min'` on due, unlocked rows and returns them with the user's timezone; `claim_outbox(lim int)` same pattern.

**Scheduled jobs (`pg_cron`)**

```sql
-- every minute, only call Vercel when there is work
select cron.schedule('planzz-dispatch', '* * * * *', $$
  select net.http_post(
    url := 'https://<app-domain>/api/cron/dispatch',
    headers := jsonb_build_object('Authorization', 'Bearer ' ||
      (select decrypted_secret from vault.decrypted_secrets where name = 'cron_secret'))
  )
  where exists (select 1 from reminders where active and next_fire_at <= now())
     or exists (select 1 from gcal_outbox where processed_at is null and attempts < 5)
$$);

-- daily at 06:00 UTC: guest cleanup, trash purge, auto-archive, expired action tokens
select cron.schedule('planzz-daily', '0 6 * * *', $$ ... same pattern to /api/cron/daily ... $$);
```

