import { expect, test, type Page } from "@playwright/test";

const AURORA_SELECTOR = "[data-aurora-blob], [data-aurora-glow]";

/**
 * Descriptions of running animations (CSS animations and transitions) in the document.
 * `root` limits the search to one subtree; `aurora` keeps only animations on aurora elements.
 */
function runningAnimations(page: Page, options: { root?: string; aurora?: boolean } = {}) {
  return page.evaluate(
    ({ root, aurora, auroraSelector }) => {
      const scope = root ? document.querySelector(root) : document.documentElement;
      if (!scope) throw new Error(`no element matches ${root}`);
      return document
        .getAnimations()
        .filter((animation) => animation.playState === "running")
        .map((animation) => {
          const target = (animation.effect as KeyframeEffect | null)?.target ?? null;
          const name = animation instanceof CSSAnimation ? animation.animationName : "(transition)";
          return { target: target instanceof Element ? target : null, name };
        })
        .filter(({ target }) => target !== null && scope.contains(target))
        .filter(({ target }) => !aurora || target?.closest(auroraSelector) != null)
        .map(({ target, name }) => `${target?.tagName.toLowerCase()} ${name}`);
    },
    { root: options.root, aurora: options.aurora ?? false, auroraSelector: AURORA_SELECTOR },
  );
}

test.describe("reduced motion", () => {
  test("landing page has no running animations", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await expect(page.locator("[data-aurora-blob]").first()).toBeAttached();
    await expect.poll(() => runningAnimations(page)).toEqual([]);
  });

  test("landing page aurora is static", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await expect.poll(() => runningAnimations(page, { aurora: true })).toEqual([]);
  });

  test("styleguide brand section aurora is static", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/styleguide");
    await expect(page.locator("#brand [data-aurora-blob]").first()).toBeAttached();
    await expect.poll(() => runningAnimations(page, { root: "#brand", aurora: true })).toEqual([]);
  });
});

test.describe("motion allowed (control)", () => {
  test("landing page aurora drifts without reduced motion", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/");
    const names = await page.evaluate(() =>
      Array.from(document.querySelectorAll('[data-variant="hero"] [data-aurora-blob]')).map(
        (el) => getComputedStyle(el).animationName,
      ),
    );
    expect(names).toHaveLength(5);
    expect(names.every((name) => name.startsWith("aurora-drift"))).toBe(true);
    await expect
      .poll(() => runningAnimations(page, { aurora: true }), {
        message: "aurora blobs should be animating",
      })
      .not.toEqual([]);
  });

  test("styleguide brand section aurora drifts without reduced motion", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/styleguide");
    await expect
      .poll(() => runningAnimations(page, { root: "#brand", aurora: true }))
      .not.toEqual([]);
  });
});
