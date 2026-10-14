import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DotGrid } from "./dot-grid";

describe("DotGrid", () => {
  it("is decorative and uses the grid-dot token", () => {
    const { container } = render(<DotGrid gap={24} className="extra" />);
    const el = container.firstElementChild as HTMLElement;
    expect(el).toHaveAttribute("aria-hidden", "true");
    expect(el).toHaveClass("pointer-events-none", "absolute", "extra");
    expect(el.style.backgroundImage).toContain("--color-grid-dot");
    expect(el.style.backgroundSize).toBe("24px 24px");
  });
});
