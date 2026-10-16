import { cn } from "@/lib/utils";

type DotGridProps = {
  className?: string;
  /** Distance between dots in px. Default 24. */
  gap?: number;
};

/**
 * Decorative dot grid for behind the matrix and canvas. Pure CSS radial-gradient using `--color-grid-dot`.
 * Fills its (relative) parent; stacking is the parent's call.
 */
export function DotGrid({ className, gap = 24 }: DotGridProps) {
  return (
    <div
      aria-hidden="true"
      data-dot-grid
      className={cn("pointer-events-none absolute inset-0 select-none", className)}
      style={{
        backgroundImage: "radial-gradient(circle, var(--color-grid-dot) 1px, transparent 1.5px)",
        backgroundSize: `${gap}px ${gap}px`,
      }}
    />
  );
}
