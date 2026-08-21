import { BRAND_PALETTE } from "./colorScale";
import type {
  BrandInDistrict,
  DistrictMarketData,
  MonthlyShare,
  ProvinceId,
  Sku,
  Variant,
} from "./types";

/**
 * ---------------------------------------------------------------------------
 * SAMPLE / PLACEHOLDER DATA GENERATOR
 * ---------------------------------------------------------------------------
 * The market-share/competitiveness NUMBERS in this file are still illustrative
 * mock data, deterministically derived from the district id so the demo is
 * stable across reloads without a backend — no city-level breakdown exists in
 * the source data yet, so per-district figures remain dummy. The BRAND names,
 * variant/flavor names, and pack sizes below, however, are real: pulled from
 * "Noodles EPOS 2026.xlsx" (Pakistan noodles-category retail audit data), so
 * the category is now noodles-centric and the competitor set matches who
 * actually sells noodles in this market. Replace the number-generating logic
 * further down with a real data source before using this for actual market
 * decisions — see README.md "Wiring in real data" for the exact shape to
 * produce instead.
 * ---------------------------------------------------------------------------
 */

export interface BrandDef {
  id: string;
  name: string;
  color: string;
}

// Real competitor set for Pakistan's packaged instant-noodles category,
// ranked by actual sales value in "Noodles EPOS 2026.xlsx": Knorr is the
// dominant player, followed by Shoop, Samyang, Indomie, and Kolson.
export const BRANDS: BrandDef[] = [
  { id: "knorr", name: "Knorr", color: BRAND_PALETTE[0] },
  { id: "shoop", name: "Shoop", color: BRAND_PALETTE[1] },
  { id: "samyang", name: "Samyang", color: BRAND_PALETTE[2] },
  { id: "indomie", name: "Indomie", color: BRAND_PALETTE[3] },
  { id: "kolson", name: "Kolson", color: BRAND_PALETTE[4] },
];

// Real flavor/variant names drawn from actual item descriptions in the EPOS
// data across these five brands (e.g. Knorr's "Blazin" line, Samyang's
// Buldak/ramen range, Indomie's Chatkhara/Lemon Tarka, Kolson's Kai Ramen
// imports and egg noodles).
const VARIANT_POOL = [
  "Chicken Noodles",
  "Chatpata Noodles",
  "Beef Noodles",
  "Masala Noodles",
  "Chicken Chatkhara Noodles",
  "Lemon Tarka Noodles",
  "Meat Masala Noodles",
  "Hot & Sour Noodles",
  "Egg Noodles",
  "Fajita Noodles",
  "Cheese Noodles",
  "Buldak Hot Chicken Ramen",
  "Cream Carbonara Ramen",
  "Kimchi Ramen",
  "Spicy Garlic Noodles",
  "Blazin' 2X Spicy Noodles",
];

// Real pack sizes/formats seen in the EPOS data for this category.
const SKU_POOL = [
  "50g Sachet",
  "65g Sachet",
  "70g Sachet",
  "72g Sachet",
  "110g Pack",
  "120g Pack",
  "140g Cup Pack",
  "227g Egg Noodles Pack",
  "4 x 65g Family Pack",
];

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

// ---- deterministic PRNG (mulberry32), seeded from a string hash ----------

function hashString(str: string): number {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  let a = seed;
  return function rand() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

class Rng {
  private rand: () => number;
  constructor(seed: string) {
    this.rand = mulberry32(hashString(seed));
  }
  next(): number {
    return this.rand();
  }
  range(min: number, max: number): number {
    return min + this.next() * (max - min);
  }
  int(min: number, max: number): number {
    return Math.floor(this.range(min, max + 1));
  }
  shuffle<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(this.next() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
}

/** Weights summing to 100, descending, with a top-heavy (power-law-ish) skew. */
function shareSplit(rng: Rng, n: number, skew: number): number[] {
  const raw = Array.from({ length: n }, (_, i) => Math.pow(rng.range(0.55, 1), i * skew) * rng.range(0.7, 1));
  const sum = raw.reduce((s, v) => s + v, 0);
  const pct = raw.map((v) => (v / sum) * 100).sort((a, b) => b - a);
  // fix rounding drift so it sums to exactly 100.0
  const rounded = pct.map((v) => Math.round(v * 10) / 10);
  const drift = Math.round((100 - rounded.reduce((s, v) => s + v, 0)) * 10) / 10;
  rounded[0] = Math.round((rounded[0] + drift) * 10) / 10;
  return rounded;
}

function last12Months(): string[] {
  const now = new Date();
  const out: string[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    out.push(`${MONTH_NAMES[d.getMonth()]} '${String(d.getFullYear()).slice(2)}`);
  }
  return out;
}

function buildHistory(rng: Rng, currentShare: number): MonthlyShare[] {
  const months = last12Months();
  // random walk backwards from the current share, then reverse
  const vals: number[] = [currentShare];
  for (let i = 1; i < 12; i++) {
    const prev = vals[i - 1];
    const drift = rng.range(-1.6, 1.6);
    const next = Math.min(45, Math.max(0.5, prev + drift));
    vals.push(Math.round(next * 10) / 10);
  }
  vals.reverse();
  return months.map((month, i) => ({ month, sharePct: vals[i] }));
}

function buildSkus(rng: Rng, variantName: string): Sku[] {
  const count = rng.int(3, 5);
  const names = rng.shuffle(SKU_POOL).slice(0, count);
  const shares = shareSplit(rng, count, 1.1);
  return names.map((name, i) => ({
    id: `${variantName}-${name}`.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    name,
    contributionPct: shares[i],
  }));
}

function buildVariants(rng: Rng, brandId: string): Variant[] {
  const names = rng.shuffle(VARIANT_POOL).slice(0, 10);
  const shares = shareSplit(rng, 10, 0.85);
  return names.map((name, i) => ({
    id: `${brandId}-${name}`.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    name,
    shareOfBrandPct: shares[i],
    skus: buildSkus(new Rng(`${brandId}|${name}|sku`), name),
  }));
}

const dataCache = new Map<string, DistrictMarketData>();

export function generateDistrictData(
  districtId: string,
  districtName: string,
  province: ProvinceId
): DistrictMarketData {
  const cached = dataCache.get(districtId);
  if (cached) return cached;

  const rng = new Rng(`${districtId}|${province}`);

  // Urban centres / provincial capitals skew toward more active brands.
  const urbanBoost = /karachi|lahore|islamabad|rawalpindi|faisalabad|multan|peshawar|quetta|gujranwala|hyderabad/i.test(
    districtName
  )
    ? 1
    : 0;
  const brandCount = Math.min(BRANDS.length, rng.int(3, 5) + urbanBoost);
  const activeBrands = rng.shuffle(BRANDS).slice(0, brandCount);
  const shares = shareSplit(rng, brandCount, 0.9);

  const brands: BrandInDistrict[] = activeBrands.map((b, i) => ({
    brandId: b.id,
    brandName: b.name,
    color: b.color,
    marketSharePct: shares[i],
    history: buildHistory(new Rng(`${districtId}|${b.id}|history`), shares[i]),
    variants: buildVariants(new Rng(`${districtId}|${b.id}|variants`), b.id),
  }));

  // Competitiveness: blend of how many brands are fighting for the district
  // and how evenly they split it (low HHI concentration = more competitive).
  const hhi = shares.reduce((s, v) => s + (v / 100) ** 2, 0);
  const fragmentation = 1 - hhi; // 0 (monopoly) .. ~1 (perfectly split)
  const maxFragmentation = 1 - 1 / brandCount;
  const fragScore = maxFragmentation > 0 ? fragmentation / maxFragmentation : 0;
  const countScore = (brandCount - 1) / (BRANDS.length - 1);
  const jitter = rng.range(-4, 4);
  const competitiveness = Math.round(
    Math.min(100, Math.max(0, 100 * (0.6 * fragScore + 0.4 * countScore) + jitter))
  );

  const result: DistrictMarketData = {
    districtId,
    competitiveness,
    totalBrandCount: brandCount,
    brands: brands.sort((a, b) => b.marketSharePct - a.marketSharePct),
  };
  dataCache.set(districtId, result);
  return result;
}
