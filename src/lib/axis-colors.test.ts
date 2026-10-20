import { describe, expect, it } from "vitest";
import { AXIS_COLORS, axisColorVar, nextAxisColor, type AxisColor } from "./axis-colors";

describe("nextAxisColor", () => {
  it("starts with blue and follows list order", () => {
    expect(nextAxisColor([])).toBe("blue");
    expect(nextAxisColor(["blue"])).toBe("violet");
    expect(nextAxisColor(["blue", "violet"])).toBe("olive");
    expect(nextAxisColor(["blue", "violet", "olive"])).toBe("pink");
    expect(nextAxisColor(["blue", "violet", "olive", "pink"])).toBe("coral");
    expect(nextAxisColor(["blue", "violet", "olive", "pink", "coral"])).toBe("red");
  });

  it("fills the first gap regardless of order used", () => {
    expect(nextAxisColor(["olive", "blue"])).toBe("violet");
  });

  it("cycles from the start when all six are used once", () => {
    expect(nextAxisColor([...AXIS_COLORS])).toBe("blue");
  });

  it("picks the least-used color with duplicates, ties by list order", () => {
    const used: AxisColor[] = [...AXIS_COLORS, "blue", "violet"];
    expect(nextAxisColor(used)).toBe("olive");
    expect(nextAxisColor([...used, "olive", "pink", "coral"])).toBe("red");
    expect(nextAxisColor([...used, "olive", "pink", "coral", "red"])).toBe("blue");
  });
});

describe("axisColorVar", () => {
  it("maps to the aurora token", () => {
    expect(axisColorVar("violet")).toBe("var(--color-aurora-violet)");
  });
});
