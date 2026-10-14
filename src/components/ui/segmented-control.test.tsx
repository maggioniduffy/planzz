import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { SegmentedControl } from "./segmented-control";

const items = [
  { value: "matrix", label: "Matrix" },
  { value: "calendar", label: "Calendar" },
  { value: "docs", label: "Docs" },
];

function Harness({ onChange }: { onChange?: (v: string) => void }) {
  const [value, setValue] = useState("matrix");
  return (
    <SegmentedControl
      aria-label="Workspace"
      items={items}
      value={value}
      onValueChange={(v) => {
        setValue(v);
        onChange?.(v);
      }}
    />
  );
}

describe("SegmentedControl", () => {
  it("renders every item and marks the selected one", () => {
    render(<Harness />);
    expect(screen.getAllByRole("radio")).toHaveLength(3);
    expect(screen.getByRole("radio", { name: "Matrix" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Docs" })).not.toBeChecked();
  });

  it("changes selection on click", async () => {
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);
    await userEvent.click(screen.getByRole("radio", { name: "Calendar" }));
    expect(onChange).toHaveBeenCalledWith("calendar");
    expect(screen.getByRole("radio", { name: "Calendar" })).toBeChecked();
  });

  it("does not clear the selection when the active item is clicked", async () => {
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);
    await userEvent.click(screen.getByRole("radio", { name: "Matrix" }));
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByRole("radio", { name: "Matrix" })).toBeChecked();
  });

  it("moves focus with arrow keys and selects with Space", async () => {
    render(<Harness />);
    await userEvent.tab();
    expect(screen.getByRole("radio", { name: "Matrix" })).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");
    expect(screen.getByRole("radio", { name: "Calendar" })).toHaveFocus();
    await userEvent.keyboard(" ");
    expect(screen.getByRole("radio", { name: "Calendar" })).toBeChecked();
  });

  it("uses the focus ring token", () => {
    render(<Harness />);
    expect(screen.getByRole("radio", { name: "Matrix" }).className).toContain(
      "focus-visible:outline-ring",
    );
  });

  it("marks the selected item with data-state on", async () => {
    render(<Harness />);
    expect(screen.getByRole("radio", { name: "Matrix" })).toHaveAttribute("data-state", "on");
    expect(screen.getByRole("radio", { name: "Docs" })).toHaveAttribute("data-state", "off");
  });

  it("moves focus back with ArrowLeft without changing the selection", async () => {
    render(<Harness />);
    await userEvent.tab();
    await userEvent.keyboard("{ArrowRight}");
    await userEvent.keyboard("{ArrowLeft}");
    expect(screen.getByRole("radio", { name: "Matrix" })).toHaveFocus();
    expect(screen.getByRole("radio", { name: "Matrix" })).toBeChecked();
  });
});
