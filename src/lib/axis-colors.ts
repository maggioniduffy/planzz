/** Aurora stops usable as an axis identity color, in assignment order. Defaults: Work=blue, Study=violet, Other=olive. */
export const AXIS_COLORS = ["blue", "violet", "olive", "pink", "coral", "red"] as const;

export type AxisColor = (typeof AXIS_COLORS)[number];

/** CSS var reference for an axis color, e.g. "var(--color-aurora-blue)". */
export function axisColorVar(color: AxisColor): string {
  return `var(--color-aurora-${color})`;
}

/**
 * Next color for a new axis: the first stop not in `used`, in list order. When all six are used,
 * the least-used stop (ties broken by list order).
 */
export function nextAxisColor(used: AxisColor[]): AxisColor {
  const counts = new Map<AxisColor, number>(AXIS_COLORS.map((c) => [c, 0]));
  for (const c of used) counts.set(c, (counts.get(c) ?? 0) + 1);
  let best: AxisColor = AXIS_COLORS[0];
  let bestCount = Infinity;
  for (const c of AXIS_COLORS) {
    const n = counts.get(c) ?? 0;
    if (n < bestCount) {
      best = c;
      bestCount = n;
    }
  }
  return best;
}
