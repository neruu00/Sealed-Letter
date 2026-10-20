const COLORS = ["#f2c14e", "#e84855", "#7cc6fe", "#9be564", "#f78fb3", "#b388eb", "#ffffff", "#c4a265"];

type Piece = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  w: number;
  h: number;
  angle: number;
  spin: number;
  flip: number;
  flipSpeed: number;
  color: string;
  life: number;
};

// Fires a one-shot confetti burst from (x, y) on the given canvas. Returns a cancel function.
export function burstConfetti(canvas: HTMLCanvasElement, x: number, y: number, count = 220): () => void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return () => {};

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const resize = () => {
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();

  const pieces: Piece[] = Array.from({ length: count }, () => {
    // mostly upward, fanning out to both sides
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 0.95;
    const speed = 9 + Math.random() * 14;
    return {
      x: x + (Math.random() - 0.5) * 60,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      w: 6 + Math.random() * 6,
      h: 9 + Math.random() * 8,
      angle: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.3,
      flip: Math.random() * Math.PI,
      flipSpeed: 0.08 + Math.random() * 0.15,
      color: COLORS[(Math.random() * COLORS.length) | 0],
      life: 1,
    };
  });

  let frame = 0;
  let last = performance.now();

  const tick = (now: number) => {
    const dt = Math.min((now - last) / 16.67, 3);
    last = now;
    const height = canvas.clientHeight;
    ctx.clearRect(0, 0, canvas.clientWidth, height);

    let alive = 0;
    for (const p of pieces) {
      if (p.life <= 0) continue;
      // heavy air drag: shoots out fast, then flutters down slowly
      p.vx *= Math.pow(0.95, dt);
      p.vy = (p.vy + 0.2 * dt) * Math.pow(0.94, dt);
      p.x += p.vx * dt + Math.sin(p.flip) * 0.9;
      p.y += p.vy * dt;
      p.angle += p.spin * dt;
      p.flip += p.flipSpeed * dt;
      if (p.vy > 0) p.life -= 0.0035 * dt;
      if (p.y > height + 40) p.life = 0;
      if (p.life <= 0) continue;
      alive++;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);
      ctx.scale(1, Math.cos(p.flip));
      ctx.globalAlpha = Math.min(1, p.life * 1.5);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    }

    if (alive > 0) frame = requestAnimationFrame(tick);
    else ctx.clearRect(0, 0, canvas.clientWidth, height);
  };

  frame = requestAnimationFrame(tick);
  return () => {
    cancelAnimationFrame(frame);
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
  };
}
