# Visual language

> Part of the Planzz product spec. Index: [../plan.md](../plan.md)


Planzz reuses the Things design system as is: same tokens, `<Grain />`, `<Aurora />`, outlined icon buttons, hairline dividers, Inter + Inter Tight, shadcn/ui restyled. Phase 0 copies `globals.css` tokens and `components/brand` from the Things repo (extracting a shared package is a v2 decision). Only the additions below are new.

**Axis colors.** Each axis gets one aurora stop as its identity color, used for the column header dot, card left edge (2px), calendar events and canvas accents. New axes cycle through the remaining stops.

| Axis (default) | Token | Hex |
| --- | --- | --- |
| Work | `--aurora-blue` | `#4F63DE` |
| Study | `--aurora-violet` | `#8E6CF0` |
| Other | `--aurora-olive` | `#A9A55C` |
| (next) | `--aurora-pink`, `--aurora-coral`, `--aurora-red` |  |

**New tokens**

| Token | Value | Use |
| --- | --- | --- |
| `--color-cell` | `rgb(255 255 255 / 0.45)` + `backdrop-blur-sm` | Matrix cell background |
| `--color-cell-over` | `rgb(142 108 240 / 0.08)` | Cell highlight while dragging over |
| `--color-grid-dot` | `rgb(15 15 18 / 0.10)` | Dot grid behind the matrix and canvas |
| `--color-done` | `#3E9B6C` | Done check, streaks, goal progress (only non-aurora color) |
| `--radius-cell` | `16px` | Matrix cells |
| `--size-row-header` | `140px` | Sticky row header width |

**Matrix look.** The board sits on the `--color-paper` background with a dot grid under the grain. Cells are rounded glass panels separated by 12px gutters, not table lines. Column headers (axis name, color dot, category filter chips, count) stick to the top; row headers (status name, count) stick to the left. The Done row renders at 70% opacity and collapses by default to a single line with its count.

**Signature moments.** Aurora appears in empty cells' hover state (a faint glow from the bottom), the drop overlay, the empty Today view ("Nothing pending. Breathe."), the routine streak celebration, and auth/landing. The content area stays calm otherwise.

