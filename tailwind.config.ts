import type { Config } from "tailwindcss";

/**
 * Muul — "Slate" brand system.
 * Single source of truth for design tokens lives here + in globals.css.
 * Volt is action-only (buttons/streaks/AI highlights, ~10% of a surface).
 * Ink carries all copy. Flare is a rare accent for AI moments + urgency.
 */
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        volt: "#8C2F3D", // burgundy — the one accent (action / highlights)
        ink: "#1B2A4A", // navy — primary text + dark surfaces
        paper: "#FFFFFF", // white base background
        surface: "#F3F5F8", // cool gray-white raised surface
        flare: "#8C2F3D", // burgundy pop
        slate: "#445064",
        olive: {
          DEFAULT: "#64748B", // slate-blue — labels / links
          deep: "#475569",
        },
        muted: {
          line: "#E3E7EE",
          soft: "#C7CFDB",
          sage: "#9AA5B5",
          fog: "#6B7688",
          deep: "#2A3244",
        },
        onink: {
          DEFAULT: "#EEF1F6",
          soft: "#C4CEDE",
          faint: "#93A0BC",
          aqua: "#E7B9C0", // soft rose — accent text/tint legible on navy
        },
        tint: {
          mint: "#E7ECF3", // neutral positive tint
          line: "#E3E7EE",
          sage: "#C7CFDB",
          coral: "#F4E7EA", // draft / needs-attention (soft burgundy tint)
        },
        coral: {
          text: "#8C2F3D", // burgundy, readable as text/links on light
        },
        // Status-only semantics (never decorative): green = on-track/done,
        // red = missed/needs-action. Per the Coach Bob color system.
        verified: {
          DEFAULT: "#5FD97A",
          tint: "#DDF6E4",
          deep: "#1E8F46", // readable green for status text on light
        },
        alert: {
          DEFAULT: "#FF5C5C",
          tint: "#FFE1E1",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"], // Archivo, app-wide
        body: ["var(--font-instrument-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-space-mono)", "monospace"],
        coach: ["var(--font-display)", "sans-serif"], // Coach Bob's identity (same face, heavier/uppercase usage)
      },
      borderRadius: {
        btn: "10px",
        card: "16px",
        panel: "20px",
      },
      keyframes: {
        muulspin: { to: { transform: "rotate(360deg)" } },
        muulrise: {
          from: { opacity: "0", transform: "translateY(6px)" },
          to: { opacity: "1", transform: "none" },
        },
        backdropIn: { from: { opacity: "0" }, to: { opacity: "1" } },
        modalPop: {
          from: { opacity: "0", transform: "translateY(8px) scale(.98)" },
          to: { opacity: "1", transform: "none" },
        },
      },
      animation: {
        muulspin: "muulspin 0.8s linear infinite",
        muulrise: "muulrise .25s ease",
        backdropIn: "backdropIn .15s ease-out",
        modalPop: "modalPop .22s cubic-bezier(.34,1.2,.64,1)",
      },
    },
  },
  plugins: [],
};

export default config;
