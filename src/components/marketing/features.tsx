import { Bell, CalendarDays, LayoutGrid, PanelsTopLeft, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Feature = { title: string; body: string; icon: LucideIcon };

export const FEATURES: readonly Feature[] = [
  {
    title: "One matrix",
    body: "Areas as columns, states as rows. Drag a task between cells and edit both however you like.",
    icon: LayoutGrid,
  },
  {
    title: "A workspace per area",
    body: "Each area opens into its own board, calendar, canvas, docs, resources and goals.",
    icon: PanelsTopLeft,
  },
  {
    title: "Routines and reminders",
    body: "Daily habits with streaks, and reminders in the app, by push or by email.",
    icon: Bell,
  },
  {
    title: "Calendar",
    body: "Plan time blocks on a calendar, push dated tasks to Google Calendar and see your events.",
    icon: CalendarDays,
  },
  {
    title: "AI with your own key",
    body: "Chat about your tasks and notes with your Anthropic key. Nothing is written until you accept.",
    icon: Sparkles,
  },
];

export function Features() {
  return (
    <section
      aria-labelledby="features-heading"
      className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8"
    >
      <h2
        id="features-heading"
        className="font-heading tracking-heading text-page text-ink text-center font-semibold"
      >
        Everything in its place
      </h2>
      <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map(({ title, body, icon: Icon }) => (
          <li
            key={title}
            className="rounded-card border-line bg-surface shadow-card flex flex-col gap-3 border p-5"
          >
            <span className="border-line text-ink rounded-control flex size-9 items-center justify-center border">
              <Icon className="size-4" aria-hidden="true" />
            </span>
            <h3 className="text-card text-ink font-sans font-medium tracking-normal">{title}</h3>
            <p className="text-body text-ink-muted">{body}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
