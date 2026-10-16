import { CheckIcon, ChevronRightIcon, ListChecksIcon } from "lucide-react";
import { AuroraGlow, DotGrid } from "@/components/brand";
import { AXIS_COLORS, axisColorVar, type AxisColor } from "@/lib/axis-colors";
import { CategoryChip, CategoryChipsDemo, WorkspaceTabsDemo, ZoomDemo } from "./planzz-demos";
import { Caption, Group, Section } from "./section";

const AXIS_LABELS = ["Work", "Study", "Other"];

const cell =
  "rounded-cell border-line bg-cell relative h-28 overflow-hidden border p-3 backdrop-blur-sm";

function CellState({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className={`${cell} ${className ?? ""}`}>{children}</div>
      <Caption>{label}</Caption>
    </div>
  );
}

/** Mock card: 2px left edge in the axis color. Styleguide only; real task cards come in Phase 3. */
function MockCard({ color, children }: { color: AxisColor; children: React.ReactNode }) {
  return (
    <div
      className="rounded-card bg-surface shadow-card flex flex-col gap-1 border-l-2 px-3 py-2"
      style={{ borderLeftColor: axisColorVar(color) }}
    >
      {children}
    </div>
  );
}

function Meta({ children }: { children: React.ReactNode }) {
  return <p className="text-meta text-ink-muted flex items-center gap-3">{children}</p>;
}

function Subtasks({ done, total }: { done: number; total: number }) {
  return (
    <span className="inline-flex items-center gap-1">
      <ListChecksIcon className="size-3.5" aria-hidden="true" />
      {done}/{total}
    </span>
  );
}

export function PlanzzSection() {
  return (
    <Section
      id="planzz"
      title="Planzz"
      description="Axis colors, matrix cells, card densities, Done styling and the controls the board is built from."
    >
      <Group title="Axis colors" className="block">
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {AXIS_COLORS.map((color, i) => (
            <li key={color} className="flex flex-col gap-2">
              <div
                className="rounded-control border-line h-12 w-full border"
                style={{ background: axisColorVar(color) }}
              />
              <div className="flex flex-col">
                <span className="text-meta text-ink font-medium">
                  {AXIS_LABELS[i] ?? "Next"} · {color}
                </span>
                <Caption>{i < AXIS_LABELS.length ? "Default axis" : "Assigned next"}</Caption>
              </div>
            </li>
          ))}
        </ul>
      </Group>

      <Group title="Matrix cell states" className="block">
        <div className="rounded-card border-line relative overflow-hidden border p-6">
          <DotGrid />
          <div className="relative grid gap-4 sm:grid-cols-3">
            <CellState label="Idle · bg-cell, backdrop-blur-sm, rounded-cell">
              <p className="text-meta text-ink-subtle">No tasks</p>
            </CellState>
            <CellState label="Hover · faint aurora glow from the bottom">
              <AuroraGlow tone="violet" animated={false} className="-bottom-16 left-4 h-24 w-3/4" />
              <p className="text-meta text-ink-subtle relative">No tasks</p>
            </CellState>
            <CellState label="Drag over · bg-cell-over" className="bg-cell-over">
              <p className="text-meta text-ink-subtle">Drop here</p>
            </CellState>
          </div>
        </div>
      </Group>

      <Group title="Card densities" className="block">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="flex flex-col gap-2">
            <Caption>Overview · title only</Caption>
            <MockCard color="blue">
              <p className="text-meta text-ink truncate font-medium">Prepare quarterly review</p>
            </MockCard>
          </div>
          <div className="flex flex-col gap-2">
            <Caption>Default · title and meta line</Caption>
            <MockCard color="violet">
              <p className="text-body text-ink font-medium">Read chapter 4</p>
              <Meta>
                <span>Due Fri, 17:00</span>
                <Subtasks done={1} total={3} />
              </Meta>
            </MockCard>
          </div>
          <div className="flex flex-col gap-2">
            <Caption>Detail · title, meta, category, notes</Caption>
            <MockCard color="olive">
              <p className="text-card text-ink font-medium">Plan the allotment</p>
              <Meta>
                <span>Due Sun</span>
                <Subtasks done={0} total={5} />
              </Meta>
              <div>
                <CategoryChip />
              </div>
              <p className="text-meta text-ink-muted line-clamp-2">
                Sketch the beds, check seed stock and order compost before the weekend.
              </p>
            </MockCard>
          </div>
        </div>
      </Group>

      <Group title="Done styling" className="block">
        <div className="flex max-w-md flex-col gap-3">
          <div className="opacity-70" data-testid="done-row">
            <MockCard color="blue">
              <p className="text-body text-ink flex items-center gap-2 font-medium">
                <CheckIcon className="text-done size-4" aria-hidden="true" />
                Send invoice
              </p>
              <Meta>
                <span>Done yesterday</span>
              </Meta>
            </MockCard>
          </div>
          <button
            type="button"
            className="rounded-control border-line bg-cell text-meta text-ink-muted hover:text-ink flex h-9 items-center gap-2 border px-3 backdrop-blur-sm"
          >
            <ChevronRightIcon className="size-4" aria-hidden="true" />
            <CheckIcon className="text-done size-4" aria-hidden="true" />
            Done
            <span className="tabular-nums">12</span>
          </button>
          <Caption>
            Done row at 70% opacity, check in --color-done; collapsed Done row on one line
          </Caption>
        </div>
      </Group>

      <Group title="Workspace tabs and zoom" className="items-center gap-6">
        <WorkspaceTabsDemo />
        <ZoomDemo />
      </Group>

      <Group title="Category chips" className="block">
        <CategoryChipsDemo />
      </Group>
    </Section>
  );
}
