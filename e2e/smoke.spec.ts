import { expect, test } from "@playwright/test";
import { trackConsoleErrors } from "./helpers";

for (const path of ["/", "/styleguide"]) {
  test(`${path} loads with 200 and no console or page errors`, async ({ page }) => {
    const consoleErrors = trackConsoleErrors(page);
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page.locator("h1").first()).toBeVisible();
    consoleErrors.assertNone();
  });
}
