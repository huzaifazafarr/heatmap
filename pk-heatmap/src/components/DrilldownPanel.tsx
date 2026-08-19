"use client";

import type { DistrictMarketData } from "@/lib/types";

interface DrilldownPanelProps {
  districtName: string;
  provinceName: string;
  data: DistrictMarketData;
  selectedBrandId: string | null;
  selectedVariantId: string | null;
  onSelectBrand: (brandId: string | null) => void;
  onSelectVariant: (variantId: string | null) => void;
  onOpenTrend: () => void;
  onClose: () => void;
}

function Bar({ pct, color }: { pct: number; color: string }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
      <div
        className="h-full rounded-full"
        style={{ width: `${Math.min(100, pct)}%`, background: color }}
      />
    </div>
  );
}

export default function DrilldownPanel({
  districtName,
  provinceName,
  data,
  selectedBrandId,
  selectedVariantId,
  onSelectBrand,
  onSelectVariant,
  onOpenTrend,
  onClose,
}: DrilldownPanelProps) {
  const brand = data.brands.find((b) => b.brandId === selectedBrandId) ?? null;
  const variant = brand?.variants.find((v) => v.id === selectedVariantId) ?? null;

  const brandsSorted = [...data.brands].sort((a, b) => b.marketSharePct - a.marketSharePct);
  const variantsSorted = brand ? [...brand.variants].sort((a, b) => b.shareOfBrandPct - a.shareOfBrandPct) : [];
  const skusSorted = variant ? [...variant.skus].sort((a, b) => b.contributionPct - a.contributionPct) : [];

  return (
    <aside className="flex h-full w-full flex-col overflow-hidden rounded-xl border border-white/10 bg-[#111820] shadow-panel">
      <div className="flex items-start justify-between gap-2 border-b border-white/10 px-4 py-3">
        <div className="min-w-0">
          <nav className="flex flex-wrap items-center gap-1 text-xs text-slate-400">
            <button
              className="rounded px-1.5 py-0.5 hover:bg-white/5 hover:text-slate-100"
              onClick={() => {
                onSelectBrand(null);
                onSelectVariant(null);
              }}
            >
              {districtName}
            </button>
            {brand && (
              <>
                <span>/</span>
                <button
                  className="rounded px-1.5 py-0.5 hover:bg-white/5 hover:text-slate-100"
                  onClick={() => onSelectVariant(null)}
                >
                  {brand.brandName}
                </button>
              </>
            )}
            {variant && (
              <>
                <span>/</span>
                <span className="rounded px-1.5 py-0.5 text-slate-100">{variant.name}</span>
              </>
            )}
          </nav>
          <div className="mt-0.5 text-[11px] text-slate-500">{provinceName}</div>
        </div>
        <button
          onClick={onClose}
          aria-label="Close panel"
          className="shrink-0 rounded-md px-2 py-1 text-slate-400 hover:bg-white/5 hover:text-slate-100"
        >
          ✕
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3">
        {!brand && (
          <>
            <div className="mb-3 flex items-center justify-between">
              <div className="text-sm font-semibold text-slate-100">Brands operating here</div>
              <button
                onClick={onOpenTrend}
                className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-slate-200 hover:bg-white/10"
              >
                12-mo trend ↗
              </button>
            </div>
            <div className="mb-3 grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2">
                <div className="text-slate-500">Competitiveness</div>
                <div className="text-lg font-semibold text-slate-100">{data.competitiveness}/100</div>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2">
                <div className="text-slate-500">Active brands</div>
                <div className="text-lg font-semibold text-slate-100">{data.totalBrandCount}</div>
              </div>
            </div>
            <ul className="space-y-2.5">
              {brandsSorted.map((b) => (
                <li key={b.brandId}>
                  <button
                    onClick={() => onSelectBrand(b.brandId)}
                    className="w-full rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2 text-left transition hover:border-white/15 hover:bg-white/[0.05]"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 shrink-0 rounded-full"
                          style={{ background: b.color }}
                        />
                        <span className="text-sm font-medium text-slate-100">{b.brandName}</span>
                      </div>
                      <span className="text-sm font-semibold text-slate-100">
                        {b.marketSharePct.toFixed(1)}%
                      </span>
                    </div>
                    <div className="mt-1.5">
                      <Bar pct={b.marketSharePct} color={b.color} />
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}

        {brand && !variant && (
          <>
            <div className="mb-3 flex items-center gap-2">
              <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: brand.color }} />
              <div>
                <div className="text-sm font-semibold text-slate-100">{brand.brandName}</div>
                <div className="text-[11px] text-slate-500">
                  {brand.marketSharePct.toFixed(1)}% share in {districtName}
                </div>
              </div>
            </div>
            <div className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
              Top 10 variants
            </div>
            <ul className="space-y-2">
              {variantsSorted.map((v, i) => (
                <li key={v.id}>
                  <button
                    onClick={() => onSelectVariant(v.id)}
                    className="w-full rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2 text-left transition hover:border-white/15 hover:bg-white/[0.05]"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-2 text-sm text-slate-100">
                        <span className="w-4 shrink-0 text-right text-[11px] text-slate-500">{i + 1}</span>
                        {v.name}
                      </span>
                      <span className="text-sm font-semibold text-slate-100">
                        {v.shareOfBrandPct.toFixed(1)}%
                      </span>
                    </div>
                    <div className="mt-1.5 pl-6">
                      <Bar pct={v.shareOfBrandPct} color={brand.color} />
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}

        {brand && variant && (
          <>
            <div className="mb-3">
              <div className="text-sm font-semibold text-slate-100">{variant.name}</div>
              <div className="text-[11px] text-slate-500">
                {brand.brandName} · {variant.shareOfBrandPct.toFixed(1)}% of brand sales in {districtName}
              </div>
            </div>
            <div className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
              SKU contribution ranking
            </div>
            <ol className="space-y-2">
              {skusSorted.map((sku, i) => (
                <li
                  key={sku.id}
                  className="rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2 text-sm text-slate-100">
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold ${
                          i === 0
                            ? "bg-amber-400/20 text-amber-300"
                            : "bg-white/10 text-slate-300"
                        }`}
                      >
                        {i + 1}
                      </span>
                      {sku.name}
                    </span>
                    <span className="text-sm font-semibold text-slate-100">
                      {sku.contributionPct.toFixed(1)}%
                    </span>
                  </div>
                  <div className="mt-1.5 pl-7">
                    <Bar pct={sku.contributionPct} color={brand.color} />
                  </div>
                </li>
              ))}
            </ol>
          </>
        )}
      </div>
    </aside>
  );
}
