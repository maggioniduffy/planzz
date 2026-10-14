import { describe, expect, it } from "vitest";
import { AXIS_COLORS, axisColorVar, nextAxisColor, type AxisColor } from "./axis-colors";

describe("axis colors", () => {
  it("has the six aurora stops, defaults first", () => {
    expect(AXIS_COLORS).toEqual(["blue", "violet", "olive", "pink", "coral", "red"]);
  });

  it("maps a token to its css variable", () => {
    expect(axisColorVar("violet")).toBe("var(--color-aurora-violet)");
  });

  it("starts with blue and walks the remaining stops in order", () => {
    expect(nextAxisColor([])).toBe("blue");
    expect(nextAxisColor(["blue", "violet", "olive"])).toBe("pink");
    expect(nextAxisColor(["blue", "violet", "olive", "pink"])).toBe("coral");
    expect(nextAxisColor(["blue", "violet", "olive", "pink", "coral"])).toBe("red");
  });

  it("fills gaps before moving on", () => {
    expect(nextAxisColor(["violet", "olive"])).toBe("blue");
    expect(nextAxisColor(["blue", "olive"])).toBe("violet");
  });

  it("cycles from the start when all six are used once", () => {
    expect(nextAxisColor([...AXIS_COLORS])).toBe("blue");
  });

  it("picks the least-used stop when duplicates exist, ties in order", () => {
    const used: AxisColor[] = [...AXIS_COLORS, "blue", "violet"];
    expect(nextAxisColor(used)).toBe("olive");
    expect(nextAxisColor([...used, "olive", "pink", "coral", "red"])).toBe("blue");
    expect(nextAxisColor(["blue", "blue", "violet"])).toBe("olive");
  });
});
