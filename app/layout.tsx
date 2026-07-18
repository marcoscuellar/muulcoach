import type { Metadata } from "next";
import { Instrument_Sans, Space_Mono, Archivo_Black } from "next/font/google";
import "./globals.css";

// Archivo Black is the app-wide display face — one heavy, commanding weight.
const archivo = Archivo_Black({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-display",
  display: "swap",
});

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-instrument-sans",
  display: "swap",
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
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
    <html lang="en" className={`${archivo.variable} ${instrumentSans.variable} ${spaceMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
