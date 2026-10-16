"use client";

import * as React from "react";
import { ToggleGroup } from "radix-ui";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { focusRing } from "./focus-ring";

const itemVariants = cva(
  [
    "inline-flex items-center justify-center gap-1.5 rounded-control font-medium whitespace-nowrap text-ink-muted",
    "transition-[color,background-color] duration-(--duration-fast) ease-out-soft motion-reduce:transition-none",
    "hover:text-ink data-[state=on]:bg-surface data-[state=on]:text-ink data-[state=on]:shadow-card",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
    focusRing,
  ],
  {
    variants: {
      size: {
        sm: "h-7 px-2.5 text-meta",
        md: "h-8 px-3 text-body",
      },
    },
    defaultVariants: { size: "md" },
  },
);

type SegmentedOption<T extends string = string> = {
  value: T;
  label: React.ReactNode;
  icon?: React.ReactNode;
};

type SegmentedControlProps<T extends string = string> = VariantProps<typeof itemVariants> & {
  value: T;
  onValueChange: (value: T) => void;
  options: SegmentedOption<T>[];
  "aria-label": string;
  className?: string;
};

/** Single-select segmented control: radio semantics, arrow keys move the selection. */
function SegmentedControl<T extends string = string>({
  value,
  onValueChange,
  options,
  size,
  className,
  "aria-label": ariaLabel,
}: SegmentedControlProps<T>) {
  return (
    <ToggleGroup.Root
      type="single"
      data-slot="segmented-control"
      aria-label={ariaLabel}
      value={value}
      // Radix emits "" when the active item is clicked again; a segmented control never deselects.
      onValueChange={(next) => {
        if (next) onValueChange(next as T);
      }}
      className={cn(
        "rounded-control border-line bg-accent inline-flex items-center gap-0.5 border p-0.5",
        className,
      )}
    >
      {options.map((option) => (
        <ToggleGroup.Item
          key={option.value}
          value={option.value}
          data-slot="segmented-control-item"
          // Radio behaviour: selection follows focus, so arrow keys select (Radix only moves focus).
          onFocus={() => {
            if (option.value !== value) onValueChange(option.value);
          }}
          className={itemVariants({ size })}
        >
          {option.icon}
          {option.label}
        </ToggleGroup.Item>
      ))}
    </ToggleGroup.Root>
  );
}

export { SegmentedControl };
export type { SegmentedControlProps, SegmentedOption };
