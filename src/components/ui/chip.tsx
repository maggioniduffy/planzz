"use client";

import * as React from "react";
import { XIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { focusRing } from "./focus-ring";

type ChipProps = Omit<React.ComponentProps<"button">, "onChange" | "color"> & {
  label: string;
  pressed: boolean;
  onPressedChange: (pressed: boolean) => void;
  /** CSS color value from a token, e.g. `var(--color-aurora-1)`. Never raw hex. */
  color?: string;
  count?: number;
  /** Shows a remove button next to the chip. */
  onRemove?: () => void;
};

/** Toggleable filter chip with an optional color dot and count. */
function Chip({
  label,
  pressed,
  onPressedChange,
  color,
  count,
  onRemove,
  className,
  ...props
}: ChipProps) {
  return (
    <span
      data-slot="chip"
      data-pressed={pressed}
      className={cn(
        "text-meta inline-flex h-7 items-center rounded-full border font-medium whitespace-nowrap",
        "ease-out-soft transition-[color,background-color,border-color] duration-(--duration-fast)",
        pressed
          ? "bg-accent border-ink/30 text-ink"
          : "bg-surface border-line text-ink-muted hover:border-ink/30",
      )}
    >
      <button
        type="button"
        aria-pressed={pressed}
        onClick={() => onPressedChange(!pressed)}
        className={cn(
          "inline-flex h-full items-center gap-1.5 rounded-full px-2.5",
          onRemove && "pr-1.5",
          focusRing,
          className,
        )}
        {...props}
      >
        {color ? (
          <span
            aria-hidden="true"
            data-slot="chip-dot"
            className="size-2 shrink-0 rounded-full"
            style={{ backgroundColor: color }}
          />
        ) : null}
        {label}
        {count !== undefined ? (
          <span data-slot="chip-count" className="text-ink-subtle tabular-nums">
            {count}
          </span>
        ) : null}
      </button>
      {onRemove ? (
        <button
          type="button"
          aria-label={`Remove ${label}`}
          onClick={onRemove}
          className={cn(
            "text-ink-subtle hover:text-ink mr-1 inline-flex size-5 items-center justify-center rounded-full",
            focusRing,
          )}
        >
          <XIcon aria-hidden="true" className="size-3" />
        </button>
      ) : null}
    </span>
  );
}

export { Chip };
export type { ChipProps };
