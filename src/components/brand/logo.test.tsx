import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Logo } from "./logo";

describe("Logo", () => {
  it("is named 'Planzz' with the wordmark", () => {
    const { container } = render(<Logo />);
    expect(screen.getByRole("img", { name: "Planzz" })).toBeInTheDocument();
    expect(container.textContent).toBe("planzz");
    expect(container.querySelectorAll("rect")).toHaveLength(4);
  });

  it("is named 'Planzz' when glyph-only, with no wordmark", () => {
    const { container } = render(<Logo glyphOnly />);
    expect(screen.getByRole("img", { name: "Planzz" })).toBeInTheDocument();
    expect(container.textContent).toBe("");
  });

  it("scales the glyph with size", () => {
    const { container } = render(<Logo size={40} glyphOnly />);
    expect(container.querySelector("svg")).toHaveAttribute("width", "40");
  });

  it("uses currentColor in the mono variant", () => {
    const { container } = render(<Logo variant="mono" />);
    for (const r of container.querySelectorAll("rect")) {
      expect(r).toHaveAttribute("fill", "currentColor");
    }
  });

  it("paints the color variant with aurora tokens", () => {
    const { container } = render(<Logo />);
    expect(container.querySelector("rect")?.getAttribute("fill")).toMatch(/^var\(--color-aurora-/);
  });
});
