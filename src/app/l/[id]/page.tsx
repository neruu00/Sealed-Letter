import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { decodeImageUrl } from "@/lib/link";
import Letter from "./Letter";

export const metadata: Metadata = {
  title: "봉인된 편지가 도착했습니다",
  description: "밀랍 봉인을 깨고 편지를 열어보세요.",
  robots: { index: false },
};

export default async function LetterPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const imageUrl = decodeImageUrl(id);
  if (!imageUrl) notFound();
  return <Letter imageUrl={imageUrl} />;
}
