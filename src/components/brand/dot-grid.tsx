import { cn } from "@/lib/utils";

type DotGridProps = {
  className?: string;
  /** Distance between dots in px. Default 20. */
  gap?: number;
};

/** Decorative dot grid for the matrix and canvas background. Fills its (relative) parent. */
export function DotGrid({ className, gap = 20 }: DotGridProps) {
  return (
    <div
      aria-hidden="true"
      data-dot-grid
      className={cn("pointer-events-none absolute inset-0 select-none", className)}
      style={{
        backgroundImage: "radial-gradient(var(--color-grid-dot) 1px, transparent 1.5px)",
        backgroundSize: `${gap}px ${gap}px`,
      }}
    />
  );
}
