import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DotGrid } from "./dot-grid";

describe("DotGrid", () => {
  it("is decorative, non-interactive and uses the grid-dot token", () => {
    const { container } = render(<DotGrid />);
    const el = container.firstElementChild as HTMLElement;
    expect(el).toHaveAttribute("aria-hidden", "true");
    expect(el).toHaveClass("pointer-events-none");
    expect(el.style.backgroundImage).toContain("var(--color-grid-dot)");
  });

  it("accepts gap and className", () => {
    const { container } = render(<DotGrid gap={32} className="extra" />);
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.backgroundSize).toBe("32px 32px");
    expect(el).toHaveClass("extra");
  });
});
