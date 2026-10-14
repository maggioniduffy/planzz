import { CheckIcon } from "lucide-react";
import { AuroraGlow, DotGrid } from "@/components/brand";
import { AXIS_COLORS, axisColorVar, type AxisColor } from "@/lib/axis-colors";
import { cn } from "@/lib/utils";
import { ChipDemo, SegmentedDemo } from "./planzz-demos";
import { Caption, Group, Section } from "./section";
import { TokenValue } from "./token-value";

const AXIS_DEFAULTS: Partial<Record<AxisColor, string>> = {
  blue: "Default for Work",
  violet: "Default for Study",
  olive: "Default for Other",
};

const BOARD_TOKENS = [
  { name: "--color-cell", use: "Cell background, with backdrop-blur-sm" },
  { name: "--color-cell-over", use: "Cell highlight while dragging over" },
  { name: "--color-grid-dot", use: "Dot grid behind the board and canvas" },
  { name: "--color-done", use: "Done check, streaks, goal progress" },
  { name: "--radius-cell", use: "Matrix cells" },
  { name: "--size-row-header", use: "Sticky row header width" },
] as const;

const cellBase = "rounded-cell relative h-36 overflow-hidden border backdrop-blur-sm";

function CellMock({ label, state }: { label: string; state: "idle" | "hover" | "over" }) {
  return (
    <div className="flex flex-col gap-2">
      <div
        data-state={state}
        className={cn(
          cellBase,
          state === "over" ? "bg-cell-over border-aurora-violet" : "bg-cell border-line",
        )}
      >
        {state === "hover" ? (
          <AuroraGlow tone="violet" className="-bottom-20 left-[10%] h-36 w-4/5" />
        ) : null}
        <span className="text-meta text-ink-muted relative block p-3">To do</span>
      </div>
      <Caption>{label}</Caption>
    </div>
  );
}

type Density = "overview" | "default" | "detail";

const DENSITY_WIDTH: Record<Density, string> = {
  overview: "w-[220px]",
  default: "w-[300px]",
  detail: "w-[380px]",
};

function CardMock({
  density,
  color,
  title,
  done = false,
}: {
  density: Density;
  color: AxisColor;
  title: string;
  done?: boolean;
}) {
  return (
    <div
      data-density={density}
      data-done={done}
      className={cn(
        "bg-surface border-line rounded-card shadow-card relative max-w-full overflow-hidden border py-2.5 pr-3 pl-4",
        DENSITY_WIDTH[density],
        done && "opacity-70 saturate-50",
      )}
    >
      <span
        aria-hidden="true"
        className="absolute inset-y-0 left-0 w-0.5"
        style={{ backgroundColor: axisColorVar(color) }}
      />
      <div className="flex items-center gap-2">
        {done ? <CheckIcon aria-hidden="true" className="text-done size-4 shrink-0" /> : null}
        <p
          className={cn(
            "text-body text-ink truncate font-medium",
            done && "text-ink-muted line-through",
          )}
        >
          {title}
        </p>
      </div>
      {density !== "overview" ? (
        <div className="text-meta text-ink-subtle mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="inline-flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className="size-2 rounded-full"
              style={{ backgroundColor: axisColorVar("violet") }}
            />
            Deep work
          </span>
          <span>Due Fri</span>
          <span>1/3 subtasks</span>
        </div>
      ) : null}
      {density === "detail" ? (
        <p className="text-meta text-ink-muted mt-2 line-clamp-2">
          Outline the sections first, then fill in the numbers from the latest export. Share the
          draft with the team before Thursday.
        </p>
      ) : null}
    </div>
  );
}

export function PlanzzSection() {
  return (
    <Section
      id="planzz"
      title="Planzz"
      description="Axis colors, board tokens, matrix cell states, card densities, workspace tabs and filter chips."
    >
      <Group title="Axis colors" className="block">
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {AXIS_COLORS.map((color) => (
            <li key={color} className="flex flex-col gap-2">
              <div
                className="rounded-control border-line h-16 w-full border"
                style={{ backgroundColor: axisColorVar(color) }}
              />
              <div className="flex flex-col">
                <span className="text-meta text-ink font-medium">{color}</span>
                <Caption>{axisColorVar(color)}</Caption>
                <Caption>{AXIS_DEFAULTS[color] ?? "Assigned to new axes in order"}</Caption>
              </div>
            </li>
          ))}
        </ul>
      </Group>

      <Group title="Board tokens" className="block">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {BOARD_TOKENS.map((token) => (
            <li key={token.name} className="flex flex-col">
              <span className="text-meta text-ink font-medium">{token.name}</span>
              <TokenValue name={token.name} />
              <Caption>{token.use}</Caption>
            </li>
          ))}
        </ul>
      </Group>

      <Group title="Matrix cell states" className="block">
        <div className="rounded-card border-line relative overflow-hidden border p-6">
          <DotGrid />
          <div className="relative grid gap-6 lg:grid-cols-[var(--size-row-header)_1fr]">
            <div className="flex flex-col gap-2">
              <div className="border-line bg-surface rounded-cell flex h-36 w-(--size-row-header) max-w-full flex-col justify-center border px-4">
                <span className="text-card text-ink font-heading tracking-heading font-semibold">
                  To do
                </span>
                <Caption>3 tasks</Caption>
              </div>
              <Caption>Row header, --size-row-header</Caption>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <CellMock state="idle" label="Idle" />
              <CellMock state="hover" label="Hover: faint aurora glow from the bottom" />
              <CellMock state="over" label="Drag-over: --color-cell-over and 1px aurora border" />
            </div>
          </div>
        </div>
      </Group>

      <Group title="Card densities" className="block">
        <div className="flex flex-wrap items-start gap-6">
          <div className="flex flex-col gap-2">
            <CardMock density="overview" color="blue" title="Draft Q4 report" />
            <Caption>Overview, 220px column</Caption>
          </div>
          <div className="flex flex-col gap-2">
            <CardMock density="default" color="violet" title="Draft Q4 report" />
            <Caption>Default, 300px column</Caption>
          </div>
          <div className="flex flex-col gap-2">
            <CardMock density="detail" color="olive" title="Draft Q4 report" />
            <Caption>Detail, 380px column</Caption>
          </div>
        </div>
      </Group>

      <Group title="Done styling" className="block">
        <div className="flex flex-wrap items-start gap-6">
          <div className="flex flex-col gap-2">
            <CardMock density="default" color="blue" title="Send invoice" />
            <Caption>Active</Caption>
          </div>
          <div className="flex flex-col gap-2">
            <CardMock density="default" color="blue" title="Send invoice" done />
            <Caption>Done: 70% opacity, desaturated, --color-done check, struck title</Caption>
          </div>
        </div>
      </Group>

      <SegmentedDemo />
      <ChipDemo />
    </Section>
  );
}
