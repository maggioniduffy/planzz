import { expect, test } from "@playwright/test";

const SECTIONS = ["Colors", "Typography", "Brand", "Components", "Planzz"];

test.describe("styleguide", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/styleguide");
  });

  test("shows the key sections", async ({ page }) => {
    for (const name of SECTIONS) {
      await expect(page.getByRole("heading", { level: 2, name })).toBeVisible();
    }
  });

  test("workspace SegmentedControl changes selection on click", async ({ page }) => {
    const group = page.getByRole("radiogroup", { name: "Workspace view" });
    const board = group.getByRole("radio", { name: "Board" });
    const calendar = group.getByRole("radio", { name: "Calendar" });
    await expect(board).toBeChecked();

    await calendar.click();
    await expect(calendar).toBeChecked();
    await expect(board).not.toBeChecked();
  });

  test("workspace SegmentedControl changes selection with arrow keys", async ({ page }) => {
    const group = page.getByRole("radiogroup", { name: "Workspace view" });
    const board = group.getByRole("radio", { name: "Board" });
    const calendar = group.getByRole("radio", { name: "Calendar" });
    await board.focus();

    await page.keyboard.press("ArrowRight");
    await expect(calendar).toBeFocused();
    await expect(calendar).toBeChecked();
    await expect(board).not.toBeChecked();

    await page.keyboard.press("ArrowLeft");
    await expect(board).toBeFocused();
    await expect(board).toBeChecked();
  });

  test("category Chip toggles aria-pressed", async ({ page }) => {
    const filters = page.getByRole("group", { name: "Category filters" });
    const projects = filters.getByRole("button", { name: /^Projects/ });
    const admin = filters.getByRole("button", { name: /^Admin/ });

    await expect(projects).toHaveAttribute("aria-pressed", "true");
    await expect(admin).toHaveAttribute("aria-pressed", "false");

    await admin.click();
    await expect(admin).toHaveAttribute("aria-pressed", "true");

    await projects.click();
    await expect(projects).toHaveAttribute("aria-pressed", "false");
  });
});
