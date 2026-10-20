import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Logo, LogoGlyph } from "./logo";

describe("Logo", () => {
  it("is named 'Planzz' with the wordmark", () => {
    const { container } = render(
      <h1>
        <Logo />
      </h1>,
    );
    expect(screen.getByRole("heading", { level: 1, name: "Planzz" })).toBeInTheDocument();
    expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByText("planzz")).toBeInTheDocument();
  });

  it("is named 'Planzz' when mark-only", () => {
    render(<Logo showWordmark={false} />);
    expect(screen.getByRole("img", { name: "Planzz" })).toBeInTheDocument();
    expect(screen.queryByText("planzz")).not.toBeInTheDocument();
  });

  it("scales the glyph with size", () => {
    render(<Logo size={40} showWordmark={false} />);
    expect(screen.getByRole("img", { name: "Planzz" })).toHaveAttribute("width", "40");
  });

  it("draws a 2x2 grid of cells", () => {
    const { container } = render(<Logo showWordmark={false} />);
    expect(container.querySelectorAll("rect")).toHaveLength(4);
  });

  it("uses currentColor in the mono variant", () => {
    const { container } = render(<Logo variant="mono" showWordmark={false} />);
    const fills = Array.from(container.querySelectorAll("rect")).map((r) => r.getAttribute("fill"));
    expect(fills.every((f) => f === "currentColor")).toBe(true);
  });

  it("paints cells with aurora tokens in the color variant", () => {
    const { container } = render(<Logo showWordmark={false} />);
    const fills = Array.from(container.querySelectorAll("rect")).map((r) => r.getAttribute("fill"));
    expect(fills.every((f) => /^var\(--color-aurora-/.test(f ?? ""))).toBe(true);
    expect(container.innerHTML).not.toMatch(/#[0-9a-f]{3,8}\b/i);
  });
});

describe("LogoGlyph", () => {
  it("renders alone with the accessible name", () => {
    render(<LogoGlyph />);
    expect(screen.getByRole("img", { name: "Planzz" })).toBeInTheDocument();
  });
});
