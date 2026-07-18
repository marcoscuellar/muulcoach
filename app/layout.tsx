import type { Metadata } from "next";
import { Bricolage_Grotesque, Inter, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

// Bricolage Grotesque — the display face for headlines + brand. Bold, friendly,
// a little unconventional without being childish. Variable weights 400–800.
const display = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-display",
  display: "swap",
});

// Inter — clean, highly readable face for body copy and UI.
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-instrument-sans",
  display: "swap",
});

// IBM Plex Mono — small uppercase labels, eyebrows, and data.
const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-space-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Coach Bob — Show up. Do the thing. Every damn day.",
  description:
    "Coach Bob is the accountability coach that gets you to your goals one action at a time — builds the plan, keeps you moving, and won't let you snooze on it.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${inter.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
