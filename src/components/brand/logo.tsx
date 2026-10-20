import { cn } from "@/lib/utils";

type LogoVariant = "color" | "mono";

type LogoProps = {
  /** Glyph size in px. The wordmark scales with it. Default 24. */
  size?: number;
  showWordmark?: boolean;
  /** "color": glyph cells use aurora stops (default). "mono": single color from `currentColor`. */
  variant?: LogoVariant;
  className?: string;
};

type LogoGlyphProps = {
  size?: number;
  variant?: LogoVariant;
  className?: string;
  /** Pass false to hide from assistive tech when next to the wordmark. Default true (role img, name "Planzz"). */
  labelled?: boolean;
};

const CELLS = [
  { x: 1, y: 1, tone: "blue" },
  { x: 13, y: 1, tone: "violet" },
  { x: 1, y: 13, tone: "pink" },
  { x: 13, y: 13, tone: "coral" },
] as const;

/** 2x2 matrix glyph: four rounded cells. Colors only from tokens / currentColor. */
export function LogoGlyph({
  size = 24,
  variant = "color",
  className,
  labelled = true,
}: LogoGlyphProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      focusable="false"
      className={cn("block shrink-0 overflow-visible", className)}
      {...(labelled ? { role: "img", "aria-label": "Planzz" } : { "aria-hidden": true })}
    >
      {CELLS.map((cell) => (
        <rect
          key={cell.tone}
          data-cell={cell.tone}
          x={cell.x}
          y={cell.y}
          width="10"
          height="10"
          rx="3"
          fill={variant === "mono" ? "currentColor" : `var(--color-aurora-${cell.tone})`}
        />
      ))}
    </svg>
  );
}

/** Planzz logo: matrix glyph + "planzz" wordmark. Accessible name is always "Planzz". */
export function Logo({ size = 24, showWordmark = true, variant = "color", className }: LogoProps) {
  if (!showWordmark) {
    return (
      <span className={cn("text-ink inline-flex shrink-0", className)}>
        <LogoGlyph size={size} variant={variant} />
      </span>
    );
  }

  return (
    <span
      className={cn("text-ink inline-flex items-center", className)}
      style={{ gap: Math.round(size * 0.3) }}
    >
      <LogoGlyph size={size} variant={variant} labelled={false} />
      <span
        className="font-heading tracking-heading leading-none font-semibold"
        style={{ fontSize: Math.round(size * 0.9) }}
      >
        <span className="sr-only">Planzz</span>
        <span aria-hidden="true">planzz</span>
      </span>
    </span>
  );
}
