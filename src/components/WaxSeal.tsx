// Irregular wax blob outline, computed once so server and client render the same path.
const BLOB_PATH = (() => {
  const points: string[] = [];
  const steps = 72;
  for (let i = 0; i < steps; i++) {
    const t = (i / steps) * Math.PI * 2;
    const r = 45 + 1.8 * Math.sin(t * 5) + 1.2 * Math.sin(t * 11 + 1.3) + 0.8 * Math.sin(t * 17 + 0.4);
    points.push(`${(50 + r * Math.cos(t)).toFixed(2)},${(50 + r * Math.sin(t)).toFixed(2)}`);
  }
  return `M${points.join("L")}Z`;
})();

const ARM = "M47.6,46 L42,27.5 Q50,24 58,27.5 L52.4,46 Z";

function Cross({ fill, dx = 0, dy = 0 }: { fill: string; dx?: number; dy?: number }) {
  return (
    <g fill={fill} transform={`translate(${dx} ${dy})`}>
      {[0, 90, 180, 270].map((deg) => (
        <path key={deg} d={ARM} transform={`rotate(${deg} 50 50)`} />
      ))}
      <circle cx="50" cy="50" r="3.6" />
    </g>
  );
}

export default function WaxSeal({ id = "seal" }: { id?: string }) {
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden="true">
      <defs>
        <radialGradient id={`${id}-wax`} cx="38%" cy="32%" r="75%">
          <stop offset="0%" stopColor="#c43a3f" />
          <stop offset="45%" stopColor="#8e1a24" />
          <stop offset="100%" stopColor="#3f060c" />
        </radialGradient>
        <radialGradient id={`${id}-press`} cx="55%" cy="60%" r="65%">
          <stop offset="0%" stopColor="#8a1822" />
          <stop offset="100%" stopColor="#5a0c14" />
        </radialGradient>
      </defs>

      <path d={BLOB_PATH} fill={`url(#${id}-wax)`} />
      {/* raised rim */}
      <circle cx="50" cy="50" r="33" fill="none" stroke="#3d060b" strokeWidth="3" opacity="0.7" />
      <circle cx="50" cy="50" r="34.6" fill="none" stroke="#e0646a" strokeWidth="0.8" opacity="0.35" />
      {/* pressed field */}
      <circle cx="50" cy="50" r="31" fill={`url(#${id}-press)`} />
      <circle cx="50" cy="50" r="27.5" fill="none" stroke="#3d060b" strokeWidth="0.7" strokeDasharray="1.2 1.6" opacity="0.8" />
      {/* embossed emblem: highlight, then shadow */}
      <Cross fill="#d9575d" dx={0.7} dy={0.7} />
      <Cross fill="#4a0910" />
      {/* gloss */}
      <ellipse cx="36" cy="30" rx="13" ry="6" fill="#fff" opacity="0.12" transform="rotate(-30 36 30)" />
    </svg>
  );
}
