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
});
