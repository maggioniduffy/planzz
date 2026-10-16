import { DotGrid } from "@/components/brand";
import { cn } from "@/lib/utils";

const AXES = [
  { label: "Work", tone: "blue" },
  { label: "Study", tone: "violet" },
  { label: "Other", tone: "olive" },
] as const;
const STATUSES = ["To do", "Doing", "Waiting", "Done"] as const;

/** Which cells hold a task chip (axis index, status index). Purely decorative. */
const FILLED = new Set(["0-0", "0-1", "1-0", "1-2", "2-1", "2-3", "0-3", "1-3"]);

/** Decorative matrix: axes as columns, statuses as rows. Tokens only. */
export function MatrixIllustration({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "border-line bg-surface rounded-card relative w-full max-w-2xl overflow-hidden border p-3 text-left sm:p-4",
        className,
      )}
    >
      <DotGrid />
      <div className="relative grid grid-cols-[2.75rem_repeat(3,minmax(0,1fr))] gap-2 sm:grid-cols-[4.5rem_repeat(3,minmax(0,1fr))]">
        <span />
        {AXES.map((axis) => (
          <span
            key={axis.label}
            className="text-meta text-ink flex items-center gap-1.5 font-medium"
          >
            <span
              className="size-2 shrink-0 rounded-full"
              style={{ background: `var(--color-aurora-${axis.tone})` }}
            />
            {axis.label}
          </span>
        ))}
        {STATUSES.map((status, row) => (
          <div key={status} className="contents">
            <span className="text-meta text-ink-subtle flex items-center truncate">{status}</span>
            {AXES.map((axis, col) => (
              <div
                key={axis.label}
                className="border-line bg-cell rounded-control flex h-12 items-center border p-1.5 sm:h-14"
              >
                {FILLED.has(`${col}-${row}`) ? (
                  <span
                    className="h-full w-full rounded-sm opacity-60"
                    style={{ background: `var(--color-aurora-${axis.tone})` }}
                  />
                ) : null}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
