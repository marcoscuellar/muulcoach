// Single line-art icon system: 1.6px strokes, round joins, 24px grid.
import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Base({ size = 19, children, ...props }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {children}
    </svg>
  );
}

export const HomeIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M4 11l8-6 8 6" />
    <path d="M6 10v9h12v-9" />
  </Base>
);
export const ComposeIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
  </Base>
);
export const TrendingIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M13 3L5 13h6l-1 8 8-11h-6z" />
  </Base>
);
export const CalendarIcon = (p: IconProps) => (
  <Base {...p}>
    <rect x="3" y="4.5" width="18" height="16" rx="2" />
    <line x1="3" y1="9" x2="21" y2="9" />
    <line x1="8" y1="2.5" x2="8" y2="6" />
    <line x1="16" y1="2.5" x2="16" y2="6" />
  </Base>
);
export const CoachIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M4 5h16v11H9l-4 3z" />
  </Base>
);
export const AnalyticsIcon = (p: IconProps) => (
  <Base {...p}>
    <polyline points="4 15 9 9 13 12 20 5" />
    <polyline points="15 5 20 5 20 10" />
  </Base>
);
export const LibraryIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M6 4h12v16l-6-4-6 4z" />
  </Base>
);
export const PlusIcon = (p: IconProps) => (
  <Base strokeWidth={2} {...p}>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </Base>
);

export const WingmanIcon = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="8" />
    <circle cx="12" cy="12" r="3.5" />
  </Base>
);

// Official Coach Bob mark. Brand colors centralized here — change once to recolor.
const BRAND_ACCENT = "#8C2F3D"; // burgundy
const BRAND_CREAM = "#F4E7EA"; // soft cream — the light that reads on burgundy/navy

/** The official Coach Bob "b" mark — cream glyph on a burgundy tile. */
export function MuulMark({ size = 32 }: { size?: number; radius?: number }) {
  return <CoachBobMark size={size} square={BRAND_ACCENT} glyph={BRAND_CREAM} />;
}

/** Inverted mark — burgundy glyph on a cream tile (pops inside dark navy cards). */
export function MuulMarkVolt({ size = 26 }: { size?: number; radius?: number }) {
  return <CoachBobMark size={size} square={BRAND_CREAM} glyph={BRAND_ACCENT} />;
}

// Literal lowercase "b" lockup — matches the login email.
function CoachBobMark({ size, square, glyph }: { size: number; square: string; glyph: string }) {
  return (
    <div
      aria-hidden
      style={{
        width: size,
        height: size,
        background: square,
        borderRadius: size * 0.224,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <span
        style={{
          color: glyph,
          fontFamily: "var(--font-display)",
          fontWeight: 900,
          fontSize: size * 0.66,
          lineHeight: 1,
          marginTop: -size * 0.03,
        }}
      >
        b
      </span>
    </div>
  );
}
