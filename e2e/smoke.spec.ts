import { expect, test } from "@playwright/test";
import { trackConsoleErrors } from "./helpers";

test.describe("smoke", () => {
  test("landing page loads with headline and both CTAs", async ({ page }) => {
    const consoleErrors = trackConsoleErrors(page);
    const pageErrors: string[] = [];
    page.on("pageerror", (error) => pageErrors.push(error.message));

    const response = await page.goto("/");
    expect(response?.status()).toBe(200);
    await expect(page).toHaveTitle("Planzz");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("One screen to see your life");

    const hero = page.getByRole("heading", { level: 1 }).locator("xpath=ancestor::section[1]");
    await expect(hero.getByRole("link", { name: "Try without an account" })).toHaveAttribute(
      "href",
      "/login?guest=1",
    );
    await expect(hero.getByRole("link", { name: "Sign in" })).toHaveAttribute("href", "/login");

    consoleErrors.assertNone();
    expect(pageErrors).toEqual([]);
  });

  test("styleguide renders with every nav section and no console errors", async ({ page }) => {
    const consoleErrors = trackConsoleErrors(page);
    const response = await page.goto("/styleguide");
    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1, name: "Styleguide" })).toBeVisible();

    const nav = page.getByRole("navigation", { name: "Styleguide sections" });
    for (const [id, label] of [
      ["colors", "Colors"],
      ["typography", "Typography"],
      ["shape-motion", "Radii, shadows, motion"],
      ["brand", "Brand"],
      ["components", "Components"],
      ["planzz", "Planzz"],
    ] as const) {
      await expect(nav.getByRole("link", { name: label })).toBeVisible();
      await expect(page.locator(`section#${id}`)).toBeVisible();
    }

    consoleErrors.assertNone();
  });
});
