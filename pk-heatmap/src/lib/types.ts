export type ProvinceId = "PB" | "SD" | "KP" | "BL" | "ICT" | "GB" | "AJK";

export const PROVINCE_NAMES: Record<ProvinceId, string> = {
  PB: "Punjab",
  SD: "Sindh",
  KP: "Khyber Pakhtunkhwa",
  BL: "Balochistan",
  ICT: "Islamabad Capital Territory",
  GB: "Gilgit-Baltistan",
  AJK: "Azad Jammu & Kashmir",
};

export interface DistrictProperties {
  id: string;
  name: string;
  province: ProvinceId;
}

export interface ProvinceProperties {
  id: string;
  name: string;
}

/** One SKU (pack size / pack variant) ranked by its contribution within a Variant. */
export interface Sku {
  id: string;
  name: string;
  /** Share of the parent variant's sales value in this district, in percent. Ranked SKUs in a variant sum to 100. */
  contributionPct: number;
}

/** A product line under a brand, e.g. "Chicken Stock Cubes". */
export interface Variant {
  id: string;
  name: string;
  /** Share of the parent brand's sales value in this district that this variant accounts for. */
  shareOfBrandPct: number;
  skus: Sku[];
}

/** One month's market-share reading for a brand in a district. */
export interface MonthlyShare {
  /** ISO month, e.g. "2025-09". */
  month: string;
  sharePct: number;
}

/** A brand's presence in a single district. */
export interface BrandInDistrict {
  brandId: string;
  brandName: string;
  color: string;
  /** Current market share in this district, in percent. All brands in a district sum to 100. */
  marketSharePct: number;
  /** Trailing 12 months of market share for this brand in this district. */
  history: MonthlyShare[];
  /** Top variants sold by this brand in this district, ranked by contribution. */
  variants: Variant[];
}

/** Full competitive dataset for one district. */
export interface DistrictMarketData {
  districtId: string;
  /** 0-100 competitive-intensity score driving the heatmap color (higher = more competitive). */
  competitiveness: number;
  totalBrandCount: number;
  brands: BrandInDistrict[];
}

export type MarketDataset = Record<string, DistrictMarketData>;
