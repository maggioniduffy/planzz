import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { Chip } from "./chip";

function Harness({ onRemove }: { onRemove?: () => void }) {
  const [pressed, setPressed] = useState(false);
  return (
    <Chip
      label="Errands"
      count={3}
      color="var(--color-aurora-1)"
      pressed={pressed}
      onPressedChange={setPressed}
      onRemove={onRemove}
    />
  );
}

describe("Chip", () => {
  it("toggles aria-pressed on click", async () => {
    render(<Harness />);
    const chip = screen.getByRole("button", { name: /Errands/ });
    expect(chip).toHaveAttribute("aria-pressed", "false");
    await userEvent.click(chip);
    expect(chip).toHaveAttribute("aria-pressed", "true");
    await userEvent.click(chip);
    expect(chip).toHaveAttribute("aria-pressed", "false");
  });

  it("toggles with the keyboard", async () => {
    render(<Harness />);
    await userEvent.tab();
    await userEvent.keyboard("{Enter}");
    expect(screen.getByRole("button", { name: /Errands/ })).toHaveAttribute("aria-pressed", "true");
  });

  it("renders the color dot from the passed token and the count", () => {
    const { container } = render(<Harness />);
    const dot = container.querySelector("[data-slot='chip-dot']") as HTMLElement;
    expect(dot.style.backgroundColor).toBe("var(--color-aurora-1)");
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("omits the dot without a color", () => {
    const { container } = render(<Chip label="All" pressed={false} onPressedChange={() => {}} />);
    expect(container.querySelector("[data-slot='chip-dot']")).toBeNull();
  });

  it("renders a remove button only when onRemove is passed", async () => {
    const onRemove = vi.fn();
    const { rerender } = render(<Harness />);
    expect(screen.queryByRole("button", { name: "Remove Errands" })).toBeNull();
    rerender(<Harness onRemove={onRemove} />);
    await userEvent.click(screen.getByRole("button", { name: "Remove Errands" }));
    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it("reflects a pressed prop as aria-pressed", () => {
    render(<Chip label="Work" pressed onPressedChange={() => {}} />);
    expect(screen.getByRole("button", { name: "Work" })).toHaveAttribute("aria-pressed", "true");
  });

  it("toggles with Space as well as Enter", async () => {
    render(<Harness />);
    await userEvent.tab();
    await userEvent.keyboard(" ");
    expect(screen.getByRole("button", { name: /Errands/ })).toHaveAttribute("aria-pressed", "true");
  });

  it("removing does not toggle the pressed state", async () => {
    const onRemove = vi.fn();
    const onPressedChange = vi.fn();
    render(
      <Chip
        label="Errands"
        pressed={false}
        onPressedChange={onPressedChange}
        onRemove={onRemove}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Remove Errands" }));
    expect(onRemove).toHaveBeenCalledTimes(1);
    expect(onPressedChange).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Errands" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });
});
