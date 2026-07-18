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
        // Monochrome + bone. No color accent — contrast and weight do the work.
        // Ink (near-black), paper (white), and bone (warm off-white) carry it all.
        volt: "#1B1B1D", // action / emphasis = ink (no accent hue)
        ink: "#1B1B1D", // near-black — primary text + dark surfaces
        paper: "#FFFFFF", // white base background
        surface: "#ECE6DA", // bone — warm off-white raised surface
        flare: "#1B1B1D", // emphasis = ink
        bone: "#ECE6DA", // warm off-white
        slate: "#5A554C", // warm gray — muted body
        olive: {
          DEFAULT: "#8A8378", // warm gray — labels / links
          deep: "#6B6558",
        },
        muted: {
          line: "#E4DFD4", // warm hairline border
          soft: "#CFC8B9",
          sage: "#A8A192",
          fog: "#736C5F", // secondary text
          deep: "#2A2822",
        },
        onink: {
          DEFAULT: "#F0ECE3", // bone-white text on ink
          soft: "#CFC9BB",
          faint: "#9A9384",
          aqua: "#CFC9BB", // light bone tint legible on ink
        },
        tint: {
          mint: "#EDE8DE", // neutral warm tint
          line: "#E4DFD4",
          sage: "#CFC8B9",
          coral: "#ECE6DA", // draft / needs-attention → bone
        },
        coral: {
          text: "#1B1B1D", // ink — readable as text/links on light
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
