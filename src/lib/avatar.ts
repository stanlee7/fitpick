// 오프라인·file://(Electron) 환경에서도 깨지지 않는 인라인 SVG 아바타.
// 외부 이미지(예: Unsplash) 대신 이름 기반 이니셜 + 그라데이션 배경을 data-URI로 생성.

const PALETTES: [string, string][] = [
  ["#3182f6", "#1b64da"], // blue
  ["#8b5cf6", "#6d28d9"], // violet
  ["#10b981", "#047857"], // emerald
  ["#f59e0b", "#d97706"], // amber
  ["#ef4444", "#b91c1c"], // red
  ["#0ea5e9", "#0369a1"], // sky
];

function hashCode(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0; // 32bit
  }
  return Math.abs(h);
}

/**
 * 이름으로부터 결정적인(같은 이름 → 같은 색) 인라인 SVG 아바타 data-URI 생성.
 * 한글 이니셜도 그대로 지원.
 */
export function avatarFor(name: string): string {
  const trimmed = (name || "").trim();
  const initial = (trimmed[0] || "?").toUpperCase();
  const [c1, c2] = PALETTES[hashCode(trimmed || "?") % PALETTES.length];

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">` +
    `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">` +
    `<stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/>` +
    `</linearGradient></defs>` +
    `<rect width="256" height="256" fill="url(#g)"/>` +
    `<text x="50%" y="50%" dy="0.35em" text-anchor="middle" ` +
    `font-family="Inter, -apple-system, sans-serif" font-size="120" font-weight="700" fill="#ffffff">` +
    `${initial}</text></svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
