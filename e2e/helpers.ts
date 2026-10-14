import { expect, type Page } from "@playwright/test";

/** Collects console errors and page errors; call `assertNone()` at the end of a test. */
export function trackConsoleErrors(page: Page) {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  return { assertNone: () => expect(errors).toEqual([]) };
}

/**
 * Counts aurora elements and the Web Animations that are currently running on them.
 * `running` is 0 when the drift is stopped (prefers-reduced-motion).
 */
export async function auroraAnimationState(page: Page) {
  return page.evaluate(() => {
    const SELECTOR = "[data-aurora-blob], [data-aurora-glow]";
    const elements = Array.from(document.querySelectorAll<HTMLElement>(SELECTOR));
    const running = document
      .getAnimations()
      .filter(
        (animation) =>
          animation.playState === "running" &&
          animation.effect instanceof KeyframeEffect &&
          animation.effect.target instanceof Element &&
          animation.effect.target.matches(SELECTOR),
      );
    const names = elements.map((el) => getComputedStyle(el).animationName);
    return { elements: elements.length, running: running.length, names };
  });
}
