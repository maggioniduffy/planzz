import { DotGrid } from "@/components/brand";
import { cn } from "@/lib/utils";

const AXES = [
  { name: "Work", dot: "bg-aurora-blue", edge: "border-l-aurora-blue" },
  { name: "Study", dot: "bg-aurora-violet", edge: "border-l-aurora-violet" },
  { name: "Other", dot: "bg-aurora-olive", edge: "border-l-aurora-olive" },
] as const;

const ROWS = [
  { status: "To do", cards: [["Draft Q4 plan"], ["Read chapter 6"], ["Renew passport"]] },
  { status: "Doing", cards: [["Ship onboarding"], ["Physics problem set"], []] },
  { status: "Waiting", cards: [["Design review"], [], ["Parcel pickup"]] },
  { status: "Done", cards: [["Send invoice"], ["Lab report"], ["Book flights"]] },
] as const;

/** Static, decorative rendition of the home matrix (axes x statuses). Server component, no JS. */
export function MatrixPreview({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      data-testid="matrix-preview"
      className={cn(
        "rounded-card border-line bg-surface shadow-card relative grid grid-cols-[3.25rem_repeat(3,minmax(0,1fr))] gap-1.5 border p-2 backdrop-blur-sm sm:grid-cols-[4.5rem_repeat(3,minmax(0,1fr))] sm:gap-3 sm:p-4",
        className,
      )}
    >
      <DotGrid className="rounded-card" />
      <div />
      {AXES.map((axis) => (
        <div
          key={axis.name}
          className="text-meta text-ink flex min-w-0 items-center gap-1.5 px-1 font-medium"
        >
          <span className={cn("size-2 shrink-0 rounded-full", axis.dot)} />
          <span className="truncate">{axis.name}</span>
        </div>
      ))}
      {ROWS.map((row) => (
        <MatrixRow key={row.status} status={row.status} cards={row.cards} />
      ))}
    </div>
  );
}

function MatrixRow({ status, cards }: { status: string; cards: readonly (readonly string[])[] }) {
  const done = status === "Done";
  return (
    <>
      <div className="text-meta text-ink-subtle flex items-start px-0.5 pt-2 sm:px-1">
        <span className="truncate">{status}</span>
      </div>
      {AXES.map((axis, i) => (
        <div
          key={axis.name}
          className={cn(
            "rounded-cell bg-cell flex min-h-14 min-w-0 flex-col gap-1.5 p-1.5 sm:min-h-16 sm:p-2",
            done && "opacity-70",
          )}
        >
          {(cards[i] ?? []).map((title) => (
            <div
              key={title}
              className={cn(
                "text-meta text-ink bg-surface rounded-control shadow-card truncate border-l-2 px-2 py-1",
                axis.edge,
              )}
            >
              {title}
            </div>
          ))}
        </div>
      ))}
    </>
  );
}
