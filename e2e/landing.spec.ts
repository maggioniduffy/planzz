import { expect, test } from "@playwright/test";
import { auroraAnimationState, trackConsoleErrors } from "./helpers";

test.describe("landing page", () => {
  test("shows the features and footer with no console errors", async ({ page }) => {
    const consoleErrors = trackConsoleErrors(page);
    await page.goto("/");

    await expect(
      page.getByRole("heading", { level: 2, name: "Everything in its place" }),
    ).toBeVisible();
    await expect(
      page.getByRole("contentinfo").getByRole("link", { name: "Sign in" }),
    ).toHaveAttribute("href", "/login");
    await expect(page.getByRole("link", { name: "Planzz home" })).toBeVisible();
    consoleErrors.assertNone();
  });

  for (const width of [375, 1440]) {
    test(`does not scroll horizontally at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/");
      const { scrollWidth, clientWidth } = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
    });
  }

  test("stops the aurora drift under reduced motion", async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: "reduce" });
    const page = await context.newPage();
    await page.goto("/");

    const state = await auroraAnimationState(page);
    expect(state.elements).toBe(5);
    expect(state.running).toBe(0);
    expect(state.names.every((name) => name === "none")).toBe(true);
    await context.close();
  });

  test("drifts when motion is allowed", async ({ page }) => {
    await page.goto("/");
    const names = await page.evaluate(() =>
      Array.from(document.querySelectorAll('[data-variant="hero"] [data-aurora-blob]')).map(
        (el) => getComputedStyle(el).animationName,
      ),
    );
    expect(names).toHaveLength(5);
    expect(names.every((name) => name.startsWith("aurora-drift"))).toBe(true);
  });
});
