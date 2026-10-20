import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PlanzzSection } from "./planzz";

describe("styleguide planzz section", () => {
  it("renders its headings and the six axis colors", () => {
    render(<PlanzzSection />);
    for (const name of [
      "Axis colors",
      "Matrix cell states",
      "Card densities",
      "Done styling",
      "Workspace tabs and zoom",
      "Category chips",
    ]) {
      expect(screen.getByRole("heading", { name })).toBeInTheDocument();
    }
    expect(screen.getByText(/Work · blue/)).toBeInTheDocument();
    expect(screen.getByText(/Study · violet/)).toBeInTheDocument();
    expect(screen.getByText(/Other · olive/)).toBeInTheDocument();
  });
});
