"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import WaxSeal from "@/components/WaxSeal";
import { burstConfetti } from "@/lib/confetti";
import { playSadTrombone } from "@/lib/sadTrombone";
import styles from "./letter.module.css";

// 0 idle (bouncing) → 1 seal cracks → 2 flap opens → 3 letter rises → 4 letter presented
type Stage = 0 | 1 | 2 | 3 | 4;

const RISE_AT = 1400;

const TIMELINE: [Stage, number][] = [
  [2, 550],
  [3, RISE_AT],
  [4, 2500],
];

const EMBERS = Array.from({ length: 16 }, (_, i) => ({
  left: `${(i * 37 + 11) % 100}%`,
  delay: `${-((i * 1.7) % 9)}s`,
  duration: `${8 + ((i * 3) % 7)}s`,
  size: `${2 + (i % 3)}px`,
  drift: `${((i % 5) - 2) * 18}px`,
}));

export default function Letter({ imageUrl }: { imageUrl: string }) {
  const [stage, setStage] = useState<Stage>(0);
  const [aspect, setAspect] = useState(1.5);
  const [failed, setFailed] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const floatRef = useRef<HTMLDivElement>(null);
  const envelopeRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<AudioContext | null>(null);
  const stopEffects = useRef<(() => void)[]>([]);
  const timers = useRef<number[]>([]);
  const imgRef = useRef<HTMLImageElement>(null);

  const clearEffects = () => {
    timers.current.forEach(clearTimeout);
    stopEffects.current.forEach((stop) => stop());
    stopEffects.current = [];
  };

  useEffect(() => clearEffects, []);

  // Confetti bursts from the envelope mouth, behind the rising letter.
  useEffect(() => {
    if (stage !== 3 || !canvasRef.current || !envelopeRef.current) return;
    const canvas = canvasRef.current;
    const env = envelopeRef.current.getBoundingClientRect();
    const box = canvas.getBoundingClientRect();
    stopEffects.current.push(burstConfetti(canvas, env.left + env.width / 2 - box.left, env.top - box.top));
  }, [stage]);

  const open = useCallback(() => {
    if (stage !== 0) return;

    // The AudioContext must be created inside the click so browsers allow it to play;
    // the trombone is scheduled ahead to line up with the letter rising.
    try {
      const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioRef.current ??= new Ctx();
      void audioRef.current.resume();
      stopEffects.current.push(playSadTrombone(audioRef.current, RISE_AT / 1000));
    } catch {
      // no audio support: the animation still plays
    }

    // Freeze the bounce where it is and ease back to rest, instead of snapping.
    const el = floatRef.current;
    if (el) {
      const current = getComputedStyle(el).transform;
      el.style.animation = "none";
      el.style.transform = current === "none" ? "" : current;
      void el.offsetHeight;
      el.style.transition = "transform 0.35s ease-out";
      el.style.transform = "none";
    }

    setStage(1);
    timers.current = TIMELINE.map(([next, at]) => window.setTimeout(() => setStage(next), at));
  }, [stage]);

  const reset = () => {
    clearEffects();
    setZoomed(false);
    setStage(0);
    const el = floatRef.current;
    if (el) {
      el.style.animation = "";
      el.style.transform = "";
      el.style.transition = "";
    }
  };

  const measure = (img: HTMLImageElement) => {
    const { naturalWidth: w, naturalHeight: h } = img;
    if (w && h) setAspect(Math.min(Math.max(w / h, 0.5), 3));
  };

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => measure(e.currentTarget);

  // The image often finishes loading before hydration, so onLoad never fires; check directly.
  useEffect(() => {
    const img = imgRef.current;
    if (!img?.complete) return;
    if (img.naturalWidth) measure(img);
    else setFailed(true);
  }, []);

  const sceneClass = [
    styles.scene,
    stage >= 1 && styles.cracked,
    stage >= 2 && styles.flapOpen,
    stage >= 3 && styles.rising,
    stage >= 4 && styles.presented,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <main className={sceneClass} style={{ "--ar": aspect } as React.CSSProperties}>
      <div className={styles.glow} aria-hidden="true" />
      <div className={styles.embers} aria-hidden="true">
        {EMBERS.map((e, i) => (
          <span
            key={i}
            style={
              {
                left: e.left,
                width: e.size,
                height: e.size,
                animationDelay: e.delay,
                animationDuration: e.duration,
                "--drift": e.drift,
              } as React.CSSProperties
            }
          />
        ))}
      </div>
      <canvas ref={canvasRef} className={styles.confetti} aria-hidden="true" />

      <div className={styles.stageArea}>
        <div className={styles.float} ref={floatRef}>
          <div
            ref={envelopeRef}
            className={styles.envelope}
            role="button"
            tabIndex={stage === 0 ? 0 : -1}
            aria-label="밀랍 봉인을 깨고 편지 열기"
            onClick={open}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                open();
              }
            }}
          >
            <div className={styles.back} />

            <div
              className={styles.letter}
              onClick={(e) => {
                if (stage === 4 && !failed) {
                  e.stopPropagation();
                  setZoomed(true);
                }
              }}
            >
              <div className={styles.photo}>
                {failed ? (
                  <p className={styles.photoError}>사진을 불러올 수 없어요</p>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    ref={imgRef}
                    src={imageUrl}
                    alt="편지 속 사진"
                    referrerPolicy="no-referrer"
                    onLoad={onImageLoad}
                    onError={() => setFailed(true)}
                    draggable={false}
                  />
                )}
              </div>
              <span className={`${styles.corner} ${styles.tl}`} />
              <span className={`${styles.corner} ${styles.tr}`} />
              <span className={`${styles.corner} ${styles.bl}`} />
              <span className={`${styles.corner} ${styles.br}`} />
            </div>

            <svg className={styles.pocket} viewBox="0 0 600 300" preserveAspectRatio="none" aria-hidden="true">
              <defs>
                <linearGradient id="side" x1="0" x2="1" y1="0" y2="0">
                  <stop offset="0" stopColor="#36121a" />
                  <stop offset="1" stopColor="#260b11" />
                </linearGradient>
                <linearGradient id="sideR" x1="1" x2="0" y1="0" y2="0">
                  <stop offset="0" stopColor="#36121a" />
                  <stop offset="1" stopColor="#260b11" />
                </linearGradient>
                <linearGradient id="bottom" x1="0" x2="0" y1="1" y2="0">
                  <stop offset="0" stopColor="#43161f" />
                  <stop offset="1" stopColor="#30101a" />
                </linearGradient>
              </defs>
              <path d="M0,0 L292,170 L0,300 Z" fill="url(#side)" />
              <path d="M600,0 L308,170 L600,300 Z" fill="url(#sideR)" />
              <path d="M0,300 L282,152 Q300,143 318,152 L600,300 Z" fill="url(#bottom)" />
              <path
                d="M0,300 L282,152 Q300,143 318,152 L600,300"
                fill="none"
                stroke="#c4a265"
                strokeOpacity="0.55"
                strokeWidth="1.2"
                vectorEffect="non-scaling-stroke"
              />
              <path
                d="M14,288 L284,163 Q300,156 316,163 L586,288"
                fill="none"
                stroke="#c4a265"
                strokeOpacity="0.25"
                strokeWidth="0.8"
                strokeDasharray="5 4"
                vectorEffect="non-scaling-stroke"
              />
              {/* corner filigree */}
              <g fill="none" stroke="#c4a265" strokeOpacity="0.45" strokeWidth="1" vectorEffect="non-scaling-stroke">
                <path d="M18,282 q22,-4 30,-22 q4,-10 -6,-10 q-8,2 -2,10" />
                <path d="M582,282 q-22,-4 -30,-22 q-4,-10 6,-10 q8,2 2,10" />
              </g>
            </svg>

            <div className={styles.flap}>
              <svg className={styles.flapFront} viewBox="0 0 600 186" preserveAspectRatio="none" aria-hidden="true">
                <defs>
                  <linearGradient id="flapFront" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0" stopColor="#3a131b" />
                    <stop offset="1" stopColor="#4e1a23" />
                  </linearGradient>
                </defs>
                <path d="M0,0 L600,0 L320,176 Q300,189 280,176 Z" fill="url(#flapFront)" />
                <path
                  d="M16,6 L584,6 L318,168 Q300,179 282,168 Z"
                  fill="none"
                  stroke="#c4a265"
                  strokeOpacity="0.5"
                  strokeWidth="1"
                  vectorEffect="non-scaling-stroke"
                />
                <path
                  d="M60,10 L540,10 L310,150 Q300,156 290,150 Z"
                  fill="none"
                  stroke="#c4a265"
                  strokeOpacity="0.18"
                  strokeWidth="0.8"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
              <svg className={styles.flapBack} viewBox="0 0 600 186" preserveAspectRatio="none" aria-hidden="true">
                <path d="M0,186 L600,186 L320,10 Q300,-3 280,10 Z" fill="#150709" />
                <path
                  d="M20,182 L580,182 L316,20 Q300,10 284,20 Z"
                  fill="none"
                  stroke="#c4a265"
                  strokeOpacity="0.2"
                  strokeWidth="0.8"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
            </div>

            <div className={styles.seal} aria-hidden="true">
              <div className={`${styles.half} ${styles.halfL}`}>
                <WaxSeal id="sealL" />
              </div>
              <div className={`${styles.half} ${styles.halfR}`}>
                <WaxSeal id="sealR" />
              </div>
            </div>
          </div>
        </div>
        <div className={styles.shadow} aria-hidden="true" />
      </div>

      <p className={styles.hint}>봉인을 눌러 편지를 여세요</p>

      <nav className={styles.actions}>
        <span className={styles.caption}>사진을 누르면 크게 볼 수 있어요</span>
        <div className={styles.buttons}>
          <button type="button" onClick={reset}>
            다시 봉인하기
          </button>
          <Link href="/">나도 편지 보내기</Link>
        </div>
      </nav>

      {zoomed && (
        <div className={styles.lightbox} onClick={() => setZoomed(false)} role="dialog" aria-label="사진 크게 보기">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageUrl} alt="편지 속 사진" referrerPolicy="no-referrer" />
        </div>
      )}
    </main>
  );
}
