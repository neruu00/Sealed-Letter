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

// Absolute base for og:image. Vercel exposes the production domain (no protocol),
// Netlify sets URL; SITE_URL overrides both (e.g. for a custom domain).
const SITE_URL =
  process.env.SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL && `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`) ||
  process.env.URL ||
  "https://sealed-letter-six.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "봉인된 편지 · Sealed Letter",
  description: "사진 한 장을 밀랍으로 봉인해 링크로 보내세요.",
  openGraph: {
    type: "website",
    siteName: "Sealed Letter",
    title: "봉인된 편지 · Sealed Letter",
    description: "사진 한 장을 밀랍으로 봉인해 링크로 보내세요.",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "밀랍으로 봉인된 편지 봉투" }],
  },
  twitter: { card: "summary_large_image", images: ["/og.png"] },
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
