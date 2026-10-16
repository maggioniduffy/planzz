import { render as rtlRender, type RenderOptions } from "@testing-library/react";
import type { ReactElement } from "react";

// Task 0.3 adds the Tooltip provider here once ui/tooltip exists.
/** Testing Library `render` with the app-level providers components expect. */
export function render(ui: ReactElement, options?: RenderOptions) {
  return rtlRender(ui, options);
}
