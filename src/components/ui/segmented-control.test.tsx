import { useState } from "react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { SegmentedControl } from "./segmented-control";

const options = [
  { value: "a", label: "Alpha" },
  { value: "b", label: "Beta" },
  { value: "c", label: "Gamma", icon: <svg data-testid="icon" /> },
];

function Harness({ onChange }: { onChange?: (v: string) => void }) {
  const [value, setValue] = useState("a");
  return (
    <SegmentedControl
      aria-label="View"
      value={value}
      onValueChange={(v) => {
        setValue(v);
        onChange?.(v);
      }}
      options={options}
    />
  );
}

describe("SegmentedControl", () => {
  it("exposes a labelled group with the selected option checked", () => {
    render(<Harness />);
    expect(screen.getByRole("radiogroup", { name: "View" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Alpha" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Beta" })).not.toBeChecked();
    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });

  it("selects on click and never deselects", async () => {
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);
    await userEvent.click(screen.getByRole("radio", { name: "Beta" }));
    expect(screen.getByRole("radio", { name: "Beta" })).toBeChecked();
    await userEvent.click(screen.getByRole("radio", { name: "Beta" }));
    expect(screen.getByRole("radio", { name: "Beta" })).toBeChecked();
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("arrow keys move focus and selection together", async () => {
    render(<Harness />);
    await userEvent.tab();
    expect(screen.getByRole("radio", { name: "Alpha" })).toHaveFocus();
    expect(screen.getByRole("radio", { name: "Alpha" })).toBeChecked();
    await userEvent.keyboard("{ArrowRight}");
    expect(screen.getByRole("radio", { name: "Beta" })).toHaveFocus();
    expect(screen.getByRole("radio", { name: "Beta" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Alpha" })).not.toBeChecked();
  });

  it("uses the shared focus ring", () => {
    render(<Harness />);
    expect(screen.getByRole("radio", { name: "Alpha" }).className).toContain(
      "focus-visible:outline-ring",
    );
  });

  it("sm size uses the compact height and text", () => {
    render(
      <SegmentedControl
        aria-label="Zoom"
        size="sm"
        value="a"
        onValueChange={() => {}}
        options={options}
      />,
    );
    const item = screen.getByRole("radio", { name: "Alpha" });
    expect(item).toHaveClass("h-7", "text-meta");
    expect(item).not.toHaveClass("h-8");
  });

  it("md size is the default", () => {
    render(<Harness />);
    expect(screen.getByRole("radio", { name: "Alpha" })).toHaveClass("h-8", "text-body");
  });
});
