# Core concepts

> Part of the Planzz product spec. Index: [../plan.md](../plan.md)


One task lives in one cell of the main matrix (axis × status) and, inside its axis, in one cell of the inner matrix (category × status). Statuses are shared, so both views always agree on a task's state.

**Main matrix** — columns = axes, rows = statuses. A column header carries filter chips for that axis's categories (All · Física II · Química · Uncategorized); picking one filters only that column, in place. Multiple chips can be active (OR). Filters persist per axis in the URL (`?cat.<axisSlug>=<categoryId>,…`) so a filtered board is linkable.

**Inner matrix** (axis workspace → Board tab) — columns = that axis's categories plus a trailing "Uncategorized" column, rows = the same statuses. Same card components and DnD as the main matrix.

**Moves and what they change**

| Drag | Main matrix | Inner matrix |
| --- | --- | --- |
| Within a cell | `position` | `position` |
| Across rows | `status_id` (+ `completed_at` when entering an `is_done` status) | same |
| Across columns | `axis_id`; `category_id` reset to null (toast offers "Pick category") | `category_id` |
| Onto a sidebar axis | `axis_id`, category null | `axis_id`, category null |

**Rules**

- Axes: 1–8, reorderable, renamable, color + optional emoji. Deleting an axis requires moving or deleting its tasks first (dialog with a target picker).
- Statuses: 2–6, reorderable, renamable. Exactly the statuses flagged `is_done` count as completed for goals, streak stats and the Done styling. At least one non-done status must exist.
- Categories: 0–20 per axis, reorderable, color optional. Deleting one sets its tasks to Uncategorized.
- Ordering: one fractional `position` per task. The main cell shows all of an axis's tasks for that status; the inner cell shows a subset in the same relative order, so a reorder in either view stays consistent in the other.
- A database constraint guarantees a task's category belongs to the task's axis (composite FK, see Data model).
- New users are seeded with 3 axes and 4 statuses by a trigger, guests included.

