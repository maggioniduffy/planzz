"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { ToggleGroup } from "radix-ui";
import { cn } from "@/lib/utils";
import { focusRing } from "./focus-ring";

const segmentedVariants = cva(
  "bg-surface border-line rounded-control inline-flex items-center gap-0.5 border p-0.5",
  {
    variants: { size: { sm: "h-8", md: "h-10" } },
    defaultVariants: { size: "md" },
  },
);

const itemVariants = cva(
  [
    "text-ink-muted inline-flex h-full items-center justify-center gap-1.5 rounded-sm px-3 font-medium whitespace-nowrap",
    "transition-[color,background-color] duration-(--duration-fast) ease-out-soft",
    "hover:text-ink data-[state=on]:bg-accent data-[state=on]:text-ink",
    "disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
    focusRing,
  ],
  {
    variants: { size: { sm: "text-meta", md: "text-sm" } },
    defaultVariants: { size: "md" },
  },
);

type SegmentedControlItem = {
  value: string;
  label: string;
  icon?: React.ReactNode;
};

type SegmentedControlProps = Omit<
  React.ComponentProps<"div">,
  "onChange" | "dir" | "defaultValue"
> &
  VariantProps<typeof segmentedVariants> & {
    items: SegmentedControlItem[];
    value: string;
    onValueChange: (value: string) => void;
  };

/** Single-select segmented control (workspace tabs, zoom). Arrow keys move focus. */
function SegmentedControl({
  items,
  value,
  onValueChange,
  size,
  className,
  ...props
}: SegmentedControlProps) {
  return (
    <ToggleGroup.Root
      data-slot="segmented-control"
      type="single"
      value={value}
      // Radix emits "" when the active item is pressed again; a segmented control never clears.
      onValueChange={(next) => {
        if (next) onValueChange(next);
      }}
      className={cn(segmentedVariants({ size }), className)}
      {...props}
    >
      {items.map((item) => (
        <ToggleGroup.Item
          key={item.value}
          value={item.value}
          data-slot="segmented-control-item"
          className={itemVariants({ size })}
        >
          {item.icon}
          {item.label}
        </ToggleGroup.Item>
      ))}
    </ToggleGroup.Root>
  );
}

export { SegmentedControl };
export type { SegmentedControlItem, SegmentedControlProps };
