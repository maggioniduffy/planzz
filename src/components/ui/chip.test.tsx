import { useState } from "react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Chip } from "./chip";

function Harness({ onChange }: { onChange?: (p: boolean) => void }) {
  const [pressed, setPressed] = useState(false);
  return (
    <Chip
      pressed={pressed}
      onPressedChange={(p) => {
        setPressed(p);
        onChange?.(p);
      }}
    >
      Work
    </Chip>
  );
}

describe("Chip", () => {
  it("toggles aria-pressed on click", async () => {
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);
    const chip = screen.getByRole("button", { name: "Work" });
    expect(chip).toHaveAttribute("aria-pressed", "false");
    await userEvent.click(chip);
    expect(chip).toHaveAttribute("aria-pressed", "true");
    await userEvent.click(chip);
    expect(chip).toHaveAttribute("aria-pressed", "false");
    expect(onChange).toHaveBeenNthCalledWith(1, true);
    expect(onChange).toHaveBeenNthCalledWith(2, false);
  });

  it("renders the color dot and count only when given", () => {
    const { container, rerender } = render(
      <Chip pressed={false} onPressedChange={() => {}}>
        Study
      </Chip>,
    );
    expect(container.querySelector("[data-slot=chip-dot]")).toBeNull();
    expect(container.querySelector("[data-slot=chip-count]")).toBeNull();
    rerender(
      <Chip pressed onPressedChange={() => {}} color="var(--aurora-blue)" count={3}>
        Study
      </Chip>,
    );
    const dot = container.querySelector<HTMLElement>("[data-slot=chip-dot]");
    expect(dot?.style.backgroundColor).toBe("var(--aurora-blue)");
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("toggles from the keyboard", async () => {
    render(<Harness />);
    await userEvent.tab();
    await userEvent.keyboard("{Enter}");
    expect(screen.getByRole("button", { name: "Work" })).toHaveAttribute("aria-pressed", "true");
  });

  it("disabled chip ignores clicks and keeps its state", async () => {
    const onChange = vi.fn();
    render(
      <Chip pressed={false} onPressedChange={onChange} disabled>
        Health
      </Chip>,
    );
    const chip = screen.getByRole("button", { name: "Health" });
    expect(chip).toBeDisabled();
    expect(chip).toHaveAttribute("aria-pressed", "false");
    await userEvent.click(chip);
    expect(onChange).not.toHaveBeenCalled();
    expect(chip).toHaveAttribute("aria-pressed", "false");
  });
});
