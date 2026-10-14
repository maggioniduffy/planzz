import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Features, FEATURES } from "./features";
import { Hero } from "./hero";
import { MatrixPreview } from "./matrix-preview";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

describe("Hero", () => {
  it("renders the headline and a one-sentence subhead", () => {
    render(<Hero />);
    expect(
      screen.getByRole("heading", { level: 1, name: "One screen to see your life" }),
    ).toBeInTheDocument();
  });

  it("links the CTAs to /login", () => {
    render(<Hero />);
    expect(screen.getByRole("link", { name: "Try without an account" })).toHaveAttribute(
      "href",
      "/login?guest=1",
    );
    expect(screen.getByRole("link", { name: "Sign in" })).toHaveAttribute("href", "/login");
  });

  it("includes the decorative matrix and aurora", () => {
    const { container } = render(<Hero />);
    expect(container.querySelector("[data-aurora]")).not.toBeNull();
    expect(screen.getByTestId("matrix-preview")).toHaveAttribute("aria-hidden", "true");
  });
});

describe("MatrixPreview", () => {
  it("shows the default axes and statuses", () => {
    render(<MatrixPreview />);
    const m = screen.getByTestId("matrix-preview");
    for (const t of ["Work", "Study", "Other", "To do", "Doing", "Waiting", "Done"]) {
      expect(within(m).getAllByText(t).length).toBeGreaterThan(0);
    }
  });
});

describe("Features", () => {
  it("lists five features", () => {
    render(<Features />);
    expect(FEATURES).toHaveLength(5);
    expect(screen.getAllByRole("listitem")).toHaveLength(5);
    expect(screen.getByRole("heading", { level: 3, name: "AI with your own key" })).toBeVisible();
  });
});

describe("SiteHeader and SiteFooter", () => {
  it("header has the logo and a sign in link", () => {
    render(<SiteHeader />);
    expect(screen.getByRole("img", { name: "Planzz" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Sign in" })).toHaveAttribute("href", "/login");
  });

  it("footer renders as contentinfo", () => {
    render(<SiteFooter />);
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });
});
