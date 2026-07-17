import type { Metadata } from "next";
import { Space_Grotesk, Instrument_Sans, Space_Mono, Archivo } from "next/font/google";
import "./globals.css";

// Coach Bob's voice gets a heavier, more commanding face than the brand font.
const archivo = Archivo({
  subsets: ["latin"],
  weight: ["700", "800", "900"],
  variable: "--font-coach",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-space-grotesk",
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
  title: "Muul — Show up. Do the thing. Every damn day.",
  description:
    "Muul is the coach that gets you to your goals one action at a time — starting with posting on LinkedIn in your authentic expert voice, and holding you to a daily streak.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${instrumentSans.variable} ${spaceMono.variable} ${archivo.variable}`}>
      <body>{children}</body>
    </html>
  );
}
