import { expect, test } from "@playwright/test";
import { auroraAnimationState } from "./helpers";

const PAGES = ["/", "/styleguide#brand"] as const;

test.describe("reduced motion", () => {
  for (const path of PAGES) {
    test(`no aurora animation runs on ${path} when reduced motion is requested`, async ({
      page,
    }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(path);
      const state = await auroraAnimationState(page);
      expect(state.elements).toBeGreaterThan(0);
      expect(state.running).toBe(0);
      expect(state.names.every((name) => name === "none")).toBe(true);
    });

    test(`aurora animations run on ${path} without reduced motion`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "no-preference" });
      await page.goto(path);
      const state = await auroraAnimationState(page);
      expect(state.elements).toBeGreaterThan(0);
      // Proves the reduced-motion assertion above is meaningful: drift is live otherwise.
      expect(state.running).toBeGreaterThan(0);
    });
  }
});
