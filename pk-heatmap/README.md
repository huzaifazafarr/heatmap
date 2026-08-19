# Pakistan Market Competitiveness Heatmap

Interactive, district-level heatmap of Pakistan for competitive-landscape analysis, built with **Next.js 14 + TypeScript + Tailwind + Recharts**, deployable to Vercel.

- **Map**: all 126 districts (geoBoundaries ADM2, Public Domain) colored on a green → yellow → red scale by a competitive-intensity score, with province outlines overlaid.
- **Click a district** → side panel lists the brands operating there and their market share.
- **Click a brand** in that panel → its top 10 variants (product lines), ranked by contribution.
- **Click a variant** → the SKUs (pack sizes) under it, ranked by % contribution to that variant's sales.
- **Double-click a district** (or use the "12-mo trend ↗" button) → a modal line chart of all active brands' market share over the trailing 12 months, one colored line per brand.

All data shown right now is **deterministic mock data** (see below) so the whole interaction flow — map → brand → variant → SKU, and the trend chart — works end to end out of the box. Swap in real numbers by replacing one function; nothing else changes.

---

## 1. Running it

This machine didn't have Node.js installed, so the project was written and reviewed carefully but **not build-tested locally**. Before you rely on it, run it once yourself:

```bash
cd pk-heatmap
npm install
npm run dev
```

Open `http://localhost:3000`. If `npm run build` reports a type or lint error, it's almost certainly a small typo — paste the error back and it's a quick fix.

## 2. Deploying to Vercel

**Easiest path (no local Node needed at all):**
1. Push this `pk-heatmap` folder to a new GitHub repository.
2. Go to [vercel.com/new](https://vercel.com/new), import that repo.
3. Framework preset auto-detects **Next.js** — leave build settings as default (`next build`).
4. Deploy. Vercel installs dependencies and builds in the cloud, so you never need Node on your own machine.

**With the Vercel CLI instead** (requires Node locally):
```bash
npm i -g vercel
vercel
```

## 3. Project structure

```
pk-heatmap/
  public/data/
    districts.geojson     # 126 districts, {id, name, province} + geometry
    provinces.geojson     # 7 provinces/territories, {id, name} + geometry
  src/
    app/page.tsx           # top-level state: selected district/brand/variant, trend modal
    app/layout.tsx, globals.css
    components/
      PakistanMap.tsx       # d3-geo projection + SVG choropleth, hover tooltip, click/dblclick
      DrilldownPanel.tsx     # brand list -> variant list -> SKU ranking, with breadcrumb
      TrendModal.tsx          # Recharts 12-month multi-line chart
      Legend.tsx
    lib/
      types.ts             # the data contract — see below
      mockData.ts           # sample data generator (swap this out for real data)
      colorScale.ts          # competitiveness -> color, brand color palette
      useGeoData.ts           # loads the two geojson files
```

## 4. Wiring in real data

Everything the UI needs per district is the `DistrictMarketData` shape in [`src/lib/types.ts`](src/lib/types.ts):

```ts
interface DistrictMarketData {
  districtId: string;        // matches the "id" property in districts.geojson
  competitiveness: number;   // 0-100, drives the map color (see below)
  totalBrandCount: number;
  brands: BrandInDistrict[];
}

interface BrandInDistrict {
  brandId: string;
  brandName: string;
  color: string;             // hex, kept consistent across the map/panel/chart
  marketSharePct: number;    // all brands in a district should sum to ~100
  history: { month: string; sharePct: number }[]; // trailing 12 months, oldest first
  variants: Variant[];       // top 10, ranked by shareOfBrandPct desc
}

interface Variant {
  id: string;
  name: string;
  shareOfBrandPct: number;   // this variant's share of the brand's sales in this district
  skus: Sku[];               // ranked by contributionPct desc
}

interface Sku {
  id: string;
  name: string;
  contributionPct: number;   // this SKU's % of the variant's sales value in this district
}
```

To connect a real data source, replace `generateDistrictData(districtId, districtName, province)` in `src/lib/mockData.ts` with a function of the same signature that:

- **fetches from your own API/database** (recommended for a live dataset — e.g. an internal endpoint that returns this exact JSON shape per district id), or
- **reads a static JSON/CSV you export** from Excel/Power BI/your EPOS system and bundle under `public/data/market.json`, keyed by district id.

Nothing in `PakistanMap.tsx`, `DrilldownPanel.tsx`, or `TrendModal.tsx` needs to change — they only consume `DistrictMarketData`.

### Competitiveness score

Currently computed from two mock signals blended together: how many brands are active in a district, and how evenly they split share (a low Herfindahl index = fragmented = more competitive). Replace this with whatever your business actually means by "competitive" — e.g. number of active competitors above a share threshold, your own field-sales intensity index, or a weighted formula your team already uses. It's one field (`competitiveness`, 0-100) — the color ramp and legend need no changes.

### Brand set

The mock data uses six illustrative competitors in Pakistan's packaged cooking/condiments category (Knorr, Maggi, Shan, National, Mehran, Nestlé), matching the EPOS analyses already in this workspace. Edit the `BRANDS` array in `mockData.ts` (or your real-data source) to match your actual competitor set — colors are assigned from a fixed, colorblind-checked palette in a stable order, so each brand keeps the same color everywhere it appears.

## 5. Geographic data & known limitations

- District boundaries are **ADM2 (126 units)** and provinces **ADM1 (7 units)** from [geoBoundaries](https://www.geoboundaries.org) (Public Domain, sourced Dec 2023 release, representing 2019 administrative boundaries).
- This dataset does **not** include a few newer/split districts that exist today (e.g. Chiniot, Nankana Sahib, Larkana, Sujawal are not present as separate polygons in this open release). If you need the current, complete ~160-district set, swap `data-src/build-geo.ps1`'s source URLs for a more complete boundary file and re-run it — the rest of the app is unaffected as long as each feature keeps an `id`/`name`/`province` property.
- Azad Jammu & Kashmir and Gilgit-Baltistan are included as their own province-level regions, consistent with the reference map you shared.
- Going to **town/tehsil level** (thousands of units) needs a different boundary source; ask if you want that swapped in — the map component doesn't care about granularity, only about valid GeoJSON with an `id`/`name`/`province`.

## 6. Design notes

- Color choices (the red/yellow/green competitiveness ramp, and the brand line-chart palette) follow a colorblind-accessibility–checked palette, not ad hoc hex picks.
- Single-click vs. double-click on the map is debounced (240ms) so a double-click doesn't also fire a stray single-click action.
- The 12-month trend chart is also reachable via a button inside the drill-down panel, in case a user doesn't discover the double-click gesture.
