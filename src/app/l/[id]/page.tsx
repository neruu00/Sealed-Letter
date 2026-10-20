import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { decodeImageUrl } from "@/lib/link";
import Letter from "./Letter";

const title = "봉인된 편지가 도착했습니다";
const description = "밀랍 봉인을 깨고 편지를 열어보세요.";

// The preview shows the sealed envelope, never the photo inside.
export const metadata: Metadata = {
  title,
  description,
  robots: { index: false },
  openGraph: {
    type: "website",
    siteName: "Sealed Letter",
    title,
    description,
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "밀랍으로 봉인된 편지 봉투" }],
  },
  twitter: { card: "summary_large_image", title, description, images: ["/og.png"] },
};

export default async function LetterPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const imageUrl = decodeImageUrl(id);
  if (!imageUrl) notFound();
  return <Letter imageUrl={imageUrl} />;
}
