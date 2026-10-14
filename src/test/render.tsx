import { render as rtlRender, type RenderOptions } from "@testing-library/react";
import type { ReactElement } from "react";

/**
 * Testing Library `render` with the app-level providers components expect.
 * No providers yet; task 0.3 adds the Tooltip provider here.
 */
export function render(ui: ReactElement, options?: Omit<RenderOptions, "wrapper">) {
  return rtlRender(ui, options);
}
