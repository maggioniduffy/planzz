"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { focusRing } from "./focus-ring";

type ChipProps = Omit<React.ComponentProps<"button">, "onClick" | "aria-pressed"> & {
  pressed: boolean;
  onPressedChange: (pressed: boolean) => void;
  /** CSS color value for the dot, e.g. `var(--color-aurora-blue)` (see lib/axis-colors). Tokens only. */
  color?: string;
  count?: number;
};

/** Toggleable filter chip with an optional color dot and count. */
function Chip({
  pressed,
  onPressedChange,
  color,
  count,
  className,
  children,
  type = "button",
  ...props
}: ChipProps) {
  return (
    <button
      type={type}
      data-slot="chip"
      aria-pressed={pressed}
      onClick={() => onPressedChange(!pressed)}
      className={cn(
        "text-meta inline-flex h-7 items-center gap-1.5 rounded-full border px-2.5 font-medium whitespace-nowrap",
        "ease-out-soft transition-[color,background-color,border-color] duration-(--duration-fast) motion-reduce:transition-none",
        "disabled:pointer-events-none disabled:opacity-50",
        pressed
          ? "border-ink/30 bg-accent text-ink"
          : "border-line bg-surface text-ink-muted hover:border-ink/30 hover:text-ink",
        focusRing,
        className,
      )}
      {...props}
    >
      {color ? (
        <span
          data-slot="chip-dot"
          aria-hidden="true"
          className="size-2 shrink-0 rounded-full"
          style={{ backgroundColor: color }}
        />
      ) : null}
      {children}
      {count !== undefined ? (
        <span data-slot="chip-count" className="text-ink-muted tabular-nums">
          {count}
        </span>
      ) : null}
    </button>
  );
}

export { Chip };
export type { ChipProps };
