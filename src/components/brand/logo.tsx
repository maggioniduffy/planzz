import { cn } from "@/lib/utils";

type LogoProps = {
  /** Glyph size in px. The wordmark scales with it. Default 24. */
  size?: number;
  /** "color": four aurora stops (default). "mono": single color from `currentColor`. */
  variant?: "color" | "mono";
  /** Render only the 2x2 matrix glyph. */
  glyphOnly?: boolean;
  className?: string;
};

const CELLS = [
  { x: 1, y: 1, token: "blue" },
  { x: 13, y: 1, token: "violet" },
  { x: 1, y: 13, token: "pink" },
  { x: 13, y: 13, token: "olive" },
] as const;

function Glyph({ size, variant }: { size: number; variant: "color" | "mono" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
      style={{ display: "block", overflow: "visible" }}
    >
      {CELLS.map((c) => (
        <rect
          key={c.token}
          x={c.x}
          y={c.y}
          width={10}
          height={10}
          rx={3}
          fill={variant === "mono" ? "currentColor" : `var(--color-aurora-${c.token})`}
        />
      ))}
    </svg>
  );
}

/** Planzz logo: 2x2 matrix glyph + "planzz" wordmark. Accessible name is always "Planzz". */
export function Logo({ size = 24, variant = "color", glyphOnly = false, className }: LogoProps) {
  return (
    <span
      role="img"
      aria-label="Planzz"
      className={cn("text-ink inline-flex shrink-0 items-center", className)}
      style={glyphOnly ? undefined : { gap: Math.round(size * 0.3) }}
    >
      <Glyph size={size} variant={variant} />
      {!glyphOnly && (
        <span
          aria-hidden="true"
          className="font-heading tracking-heading leading-none font-semibold"
          style={{ fontSize: Math.round(size * 0.9) }}
        >
          planzz
        </span>
      )}
    </span>
  );
}
