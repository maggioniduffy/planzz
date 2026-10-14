/** Axis identity colors: the six aurora stops, in the order new axes receive them. */
export const AXIS_COLORS = ["blue", "violet", "olive", "pink", "coral", "red"] as const;

export type AxisColor = (typeof AXIS_COLORS)[number];

/** CSS variable reference for an axis color, e.g. `var(--color-aurora-blue)`. */
export function axisColorVar(token: AxisColor): string {
  return `var(--color-aurora-${token})`;
}

/**
 * Next color for a new axis: the first stop in order not in `used`. When all six are used,
 * cycles by picking the least-used stop (ties broken by order).
 */
export function nextAxisColor(used: AxisColor[]): AxisColor {
  const counts = new Map<AxisColor, number>(AXIS_COLORS.map((c) => [c, 0]));
  for (const c of used) counts.set(c, (counts.get(c) ?? 0) + 1);
  let best: AxisColor = AXIS_COLORS[0];
  for (const c of AXIS_COLORS) {
    if (counts.get(c)! < counts.get(best)!) best = c;
  }
  return best;
}
