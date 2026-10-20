import type { Metadata, Viewport } from "next";
import { Cinzel_Decorative, Cormorant_Garamond, Nanum_Myeongjo } from "next/font/google";
import "./globals.css";

const display = Cinzel_Decorative({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-display",
});

const serif = Cormorant_Garamond({
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-serif",
});

const korean = Nanum_Myeongjo({
  weight: ["400", "700", "800"],
  preload: false,
  variable: "--font-korean",
});

export const metadata: Metadata = {
  title: "봉인된 편지 · Sealed Letter",
  description: "사진 한 장을 밀랍으로 봉인해 링크로 보내세요.",
};

export const viewport: Viewport = {
  themeColor: "#0b0607",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" className={`${display.variable} ${serif.variable} ${korean.variable}`}>
      <body>{children}</body>
    </html>
  );
}
