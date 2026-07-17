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
        volt: "#C4F542", // accent / action only
        ink: "#22282B", // primary text + dark surfaces
        paper: "#FFFFFF", // base background
        surface: "#F2F3F1", // subtle raised surface
        flare: "#FF6A3D", // rare AI / urgency pop
        slate: "#454b41",
        olive: {
          DEFAULT: "#5c6b1f",
          deep: "#4a5720",
        },
        muted: {
          line: "#dcdedb",
          soft: "#c1c9b5",
          sage: "#a3ad8f",
          fog: "#7c847c",
          deep: "#2c322c",
        },
        onink: {
          DEFAULT: "#EEF0EA",
          soft: "#c1c9b5",
          faint: "#a3ad8f",
          aqua: "#cdeee7",
        },
        tint: {
          mint: "#d3f4ec", // positive / posted
          line: "#dcdedb",
          sage: "#c1c9b5",
          coral: "#ffd9cb", // draft / needs-attention
        },
        coral: {
          text: "#a13a1a",
        },
      },
      fontFamily: {
        display: ["var(--font-space-grotesk)", "sans-serif"],
        body: ["var(--font-instrument-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-space-mono)", "monospace"],
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
