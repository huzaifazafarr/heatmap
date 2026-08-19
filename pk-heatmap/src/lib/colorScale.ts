/**
 * Competitive-intensity color ramp: green (low competition) -> yellow (moderate)
 * -> red (high competition), the standard RAG (red/amber/green) convention.
 * Stops match the design system's status palette so the map reads consistently
 * with any other status UI in the product.
 */
const STOPS: { at: number; hex: string }[] = [
  { at: 0, hex: "#0ca30c" }, // good / least competitive
  { at: 50, hex: "#fab219" }, // warning / moderate
  { at: 100, hex: "#d03b3b" }, // critical / most competitive
];

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbToHex([r, g, b]: [number, number, number]): string {
  const c = (v: number) => Math.round(Math.min(255, Math.max(0, v)))
    .toString(16)
    .padStart(2, "0");
  return `#${c(r)}${c(g)}${c(b)}`;
}

/** Maps a 0-100 competitiveness score to a hex color on the green -> yellow -> red ramp. */
export function competitivenessColor(score: number): string {
  const s = Math.min(100, Math.max(0, score));
  let lower = STOPS[0];
  let upper = STOPS[STOPS.length - 1];
  for (let i = 0; i < STOPS.length - 1; i++) {
    if (s >= STOPS[i].at && s <= STOPS[i + 1].at) {
      lower = STOPS[i];
      upper = STOPS[i + 1];
      break;
    }
  }
  const span = upper.at - lower.at || 1;
  const t = (s - lower.at) / span;
  const a = hexToRgb(lower.hex);
  const b = hexToRgb(upper.hex);
  const mixed: [number, number, number] = [
    a[0] + (b[0] - a[0]) * t,
    a[1] + (b[1] - a[1]) * t,
    a[2] + (b[2] - a[2]) * t,
  ];
  return rgbToHex(mixed);
}

export function competitivenessLabel(score: number): string {
  if (score >= 70) return "Highly competitive";
  if (score >= 40) return "Moderately competitive";
  return "Low competition";
}

/** Fixed, ordered categorical palette for brand series (never cycled/reassigned). */
export const BRAND_PALETTE = [
  "#3987e5", // blue
  "#d95926", // orange
  "#199e70", // aqua
  "#c98500", // yellow
  "#d55181", // magenta
  "#008300", // green
  "#9085e9", // violet
  "#e66767", // red
];
