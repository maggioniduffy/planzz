import {
  BellRingIcon,
  BotIcon,
  CalendarDaysIcon,
  FolderKanbanIcon,
  LayoutGridIcon,
  type LucideIcon,
} from "lucide-react";
import { AuroraGlow } from "@/components/brand";

const FEATURES: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: LayoutGridIcon,
    title: "A matrix for everything",
    body: "Axes as columns, statuses as rows. Drag a task between them. Rename, add or remove any of them.",
  },
  {
    icon: FolderKanbanIcon,
    title: "A workspace per axis",
    body: "Each axis has its own matrix, calendar, canvas, docs, resources and goals.",
  },
  {
    icon: BellRingIcon,
    title: "Routines and reminders",
    body: "Repeat what matters and get nudged in the app, by push or by email.",
  },
  {
    icon: CalendarDaysIcon,
    title: "Calendar",
    body: "See dated tasks on a calendar and push them to Google Calendar when you want.",
  },
  {
    icon: BotIcon,
    title: "AI, with your own key",
    body: "Chat with Claude using your own Anthropic key. It stays in your browser, and changes happen only when you accept them.",
  },
];

export function Features() {
  return (
    <section
      id="features"
      aria-labelledby="features-title"
      className="border-line relative z-10 w-full scroll-mt-4 border-t"
    >
      <AuroraGlow tone="violet" className="top-10 -right-40 h-[26rem] w-[36rem]" />
      <div className="relative mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 md:py-24">
        <p className="text-meta text-ink-subtle font-medium tracking-wide uppercase">Features</p>
        <h2
          id="features-title"
          className="font-heading tracking-heading text-ink text-page mt-2 font-semibold text-balance sm:text-[length:2.25rem] sm:leading-[1.15]"
        >
          Plan with a clear head
        </h2>
        <ul className="mt-12 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, body }) => (
            <li key={title} className="flex flex-col gap-4">
              <div
                aria-hidden="true"
                className="rounded-control border-line bg-surface text-ink flex size-10 shrink-0 items-center justify-center border"
              >
                <Icon className="size-[18px]" />
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="text-card text-ink font-medium">{title}</h3>
                <p className="text-body text-ink-muted text-pretty">{body}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
