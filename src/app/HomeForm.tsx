"use client";

import { useEffect, useState } from "react";
import { encodeImageUrl, isValidImageUrl } from "@/lib/link";
import styles from "./home.module.css";

type Preview = "idle" | "loading" | "ok" | "error";

export default function HomeForm() {
  const [url, setUrl] = useState("");
  const [preview, setPreview] = useState<Preview>("idle");
  const [link, setLink] = useState("");
  const [copied, setCopied] = useState(false);

  const trimmed = url.trim();
  const valid = isValidImageUrl(trimmed);
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    const id = window.setTimeout(() => setPreviewUrl(valid ? trimmed : ""), 400);
    return () => clearTimeout(id);
  }, [trimmed, valid]);

  const onChange = (value: string) => {
    setUrl(value);
    setLink("");
    setCopied(false);
    setPreview(isValidImageUrl(value.trim()) ? "loading" : "idle");
  };

  const seal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    setLink(`${window.location.origin}/l/${encodeImageUrl(trimmed)}`);
    setCopied(false);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
    } catch {
      const input = document.getElementById("generated-link") as HTMLInputElement | null;
      input?.select();
      document.execCommand("copy");
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <form className={styles.card} onSubmit={seal}>
      <label htmlFor="image-url" className={styles.label}>
        사진 링크
      </label>
      <input
        id="image-url"
        className={styles.input}
        type="url"
        inputMode="url"
        placeholder="https://example.com/photo.jpg"
        value={url}
        onChange={(e) => onChange(e.target.value)}
        autoComplete="off"
        spellCheck={false}
      />
      {trimmed && !valid && <p className={styles.error}>http:// 또는 https:// 로 시작하는 링크를 넣어주세요.</p>}

      {valid && (
        <div className={styles.preview} data-state={preview}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {previewUrl === trimmed && (
            <img
              key={trimmed}
              src={trimmed}
              alt="미리보기"
              referrerPolicy="no-referrer"
              onLoad={() => setPreview("ok")}
              onError={() => setPreview("error")}
            />
          )}
          {preview === "loading" && <span className={styles.previewNote}>불러오는 중…</span>}
          {preview === "error" && (
            <span className={styles.previewNote}>
              사진을 불러올 수 없어요.
              <br />
              이미지 주소(우클릭 → 이미지 주소 복사)인지 확인해주세요.
            </span>
          )}
        </div>
      )}

      <button className={styles.primary} type="submit" disabled={!valid || preview === "error"}>
        밀랍으로 봉인하기
      </button>

      {link && (
        <div className={styles.result}>
          <p className={styles.label}>봉인된 편지 링크</p>
          <div className={styles.linkRow}>
            <input id="generated-link" className={styles.input} value={link} readOnly onFocus={(e) => e.target.select()} />
            <button type="button" className={styles.copy} onClick={copy}>
              {copied ? "복사됨" : "복사"}
            </button>
          </div>
          <a className={styles.secondary} href={link} target="_blank" rel="noreferrer">
            편지 열어보기 →
          </a>
        </div>
      )}
    </form>
  );
}
