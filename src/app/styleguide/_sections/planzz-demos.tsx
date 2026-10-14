"use client";

import { useState } from "react";
import {
  CalendarIcon,
  FileTextIcon,
  LayoutGridIcon,
  LinkIcon,
  PenLineIcon,
  TargetIcon,
} from "lucide-react";
import { Chip } from "@/components/ui/chip";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { axisColorVar } from "@/lib/axis-colors";
import { Caption, Group } from "./section";

const WORKSPACE_TABS = [
  { value: "board", label: "Board", icon: <LayoutGridIcon /> },
  { value: "calendar", label: "Calendar", icon: <CalendarIcon /> },
  { value: "canvas", label: "Canvas", icon: <PenLineIcon /> },
  { value: "docs", label: "Docs", icon: <FileTextIcon /> },
  { value: "resources", label: "Resources", icon: <LinkIcon /> },
  { value: "goals", label: "Goals", icon: <TargetIcon /> },
];

const ZOOM_LEVELS = [
  { value: "overview", label: "Overview" },
  { value: "default", label: "Default" },
  { value: "detail", label: "Detail" },
];

export function SegmentedDemo() {
  const [tab, setTab] = useState("board");
  const [tabSm, setTabSm] = useState("docs");
  const [zoom, setZoom] = useState("default");
  return (
    <>
      <Group title="SegmentedControl: workspace tabs" className="items-start">
        <div className="flex max-w-full flex-col gap-2 overflow-x-auto">
          <SegmentedControl
            aria-label="Workspace tab"
            items={WORKSPACE_TABS}
            value={tab}
            onValueChange={setTab}
          />
          <Caption>md, with icons. Selected: {tab}</Caption>
        </div>
        <div className="flex max-w-full flex-col gap-2 overflow-x-auto">
          <SegmentedControl
            aria-label="Workspace tab (small)"
            size="sm"
            items={WORKSPACE_TABS.map(({ value, label }) => ({ value, label }))}
            value={tabSm}
            onValueChange={setTabSm}
          />
          <Caption>sm, labels only. Selected: {tabSm}</Caption>
        </div>
      </Group>
      <Group title="SegmentedControl: zoom" className="items-start">
        <div className="flex flex-col gap-2">
          <SegmentedControl
            aria-label="Zoom level"
            items={ZOOM_LEVELS}
            value={zoom}
            onValueChange={setZoom}
          />
          <Caption>Selected: {zoom}</Caption>
        </div>
      </Group>
    </>
  );
}

const CATEGORIES = [
  { id: "meetings", label: "Meetings", color: axisColorVar("blue"), count: 4 },
  { id: "deep-work", label: "Deep work", color: axisColorVar("violet"), count: 7 },
  { id: "admin", label: "Admin", color: axisColorVar("olive"), count: 2 },
  { id: "errands", label: "Errands", color: axisColorVar("coral") },
];

export function ChipDemo() {
  const [pressed, setPressed] = useState<Record<string, boolean>>({ "deep-work": true });
  const [removable, setRemovable] = useState(["Waiting on reply", "Q4 review"]);
  const [plain, setPlain] = useState(false);
  return (
    <>
      <Group title="Chip: category filters" className="items-start">
        {CATEGORIES.map((c) => (
          <Chip
            key={c.id}
            label={c.label}
            color={c.color}
            count={c.count}
            pressed={pressed[c.id] ?? false}
            onPressedChange={(next) => setPressed((p) => ({ ...p, [c.id]: next }))}
          />
        ))}
      </Group>
      <Group title="Chip: plain and removable" className="items-start">
        <Chip label="Plain chip" pressed={plain} onPressedChange={setPlain} />
        <Chip label="Always on" pressed onPressedChange={() => {}} color={axisColorVar("pink")} />
        {removable.map((label) => (
          <Chip
            key={label}
            label={label}
            pressed={false}
            onPressedChange={() => {}}
            onRemove={() => setRemovable((list) => list.filter((l) => l !== label))}
          />
        ))}
        {removable.length === 0 ? <Caption>All removed. Reload to reset.</Caption> : null}
      </Group>
    </>
  );
}
