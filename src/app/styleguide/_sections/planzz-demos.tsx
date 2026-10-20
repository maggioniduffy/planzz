"use client";

import { useState } from "react";
import { Chip } from "@/components/ui/chip";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { axisColorVar, type AxisColor } from "@/lib/axis-colors";

const TAB_OPTIONS = [
  { value: "board", label: "Board" },
  { value: "calendar", label: "Calendar" },
  { value: "canvas", label: "Canvas" },
  { value: "docs", label: "Docs" },
  { value: "resources", label: "Resources" },
  { value: "goals", label: "Goals" },
];

const ZOOM_OPTIONS = [
  { value: "overview", label: "Overview" },
  { value: "default", label: "Default" },
  { value: "detail", label: "Detail" },
];

export function WorkspaceTabsDemo() {
  const [tab, setTab] = useState<string>("board");
  return (
    <SegmentedControl
      aria-label="Workspace view"
      value={tab}
      onValueChange={setTab}
      options={TAB_OPTIONS}
    />
  );
}

export function ZoomDemo() {
  const [zoom, setZoom] = useState("default");
  return (
    <SegmentedControl
      aria-label="Zoom level"
      size="sm"
      value={zoom}
      onValueChange={setZoom}
      options={ZOOM_OPTIONS}
    />
  );
}

const CATEGORIES: { color: AxisColor; label: string; count: number }[] = [
  { color: "blue", label: "Projects", count: 12 },
  { color: "violet", label: "Admin", count: 4 },
  { color: "olive", label: "Learning", count: 7 },
  { color: "pink", label: "Health", count: 0 },
];

export function CategoryChipsDemo() {
  const [active, setActive] = useState<Set<string>>(new Set(["Projects"]));
  return (
    <div role="group" aria-label="Category filters" className="flex flex-wrap items-center gap-2">
      {CATEGORIES.map((c) => (
        <Chip
          key={c.label}
          color={axisColorVar(c.color)}
          count={c.count}
          pressed={active.has(c.label)}
          onPressedChange={(on) =>
            setActive((prev) => {
              const next = new Set(prev);
              if (on) next.add(c.label);
              else next.delete(c.label);
              return next;
            })
          }
        >
          {c.label}
        </Chip>
      ))}
      <Chip pressed={false} onPressedChange={() => {}} disabled>
        Disabled
      </Chip>
    </div>
  );
}

/** Non-interactive-looking chip for the Detail mock card. */
export function CategoryChip() {
  const [on, setOn] = useState(false);
  return (
    <Chip pressed={on} onPressedChange={setOn} color={axisColorVar("olive")}>
      Garden
    </Chip>
  );
}
