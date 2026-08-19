"use client";

import { useMemo, useState } from "react";
import DrilldownPanel from "@/components/DrilldownPanel";
import Legend from "@/components/Legend";
import PakistanMap from "@/components/PakistanMap";
import TrendModal from "@/components/TrendModal";
import { generateDistrictData } from "@/lib/mockData";
import { PROVINCE_NAMES, type DistrictProperties } from "@/lib/types";

export default function Home() {
  const [selected, setSelected] = useState<DistrictProperties | null>(null);
  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [trendOpen, setTrendOpen] = useState(false);

  const data = useMemo(
    () => (selected ? generateDistrictData(selected.id, selected.name, selected.province) : null),
    [selected]
  );

  function handleSelectDistrict(props: DistrictProperties) {
    setSelected(props);
    setSelectedBrandId(null);
    setSelectedVariantId(null);
  }

  function handleOpenTrend(props: DistrictProperties) {
    setSelected(props);
    setTrendOpen(true);
  }

  function handleClosePanel() {
    setSelected(null);
    setSelectedBrandId(null);
    setSelectedVariantId(null);
  }

  return (
    <main className="flex h-screen w-full flex-col bg-ink-950">
      <header className="flex items-center justify-between border-b border-white/10 px-5 py-3.5">
        <div>
          <h1 className="text-base font-semibold text-slate-100">
            Pakistan Market Competitiveness Heatmap
          </h1>
          <p className="text-xs text-slate-500">
            Click a district for brands &amp; share · double-click for the 12-month trend
          </p>
        </div>
        <div className="hidden sm:block">
          <Legend />
        </div>
      </header>

      <div className="flex min-h-0 flex-1 gap-4 p-4">
        <div className="min-w-0 flex-1 rounded-xl border border-white/10 bg-[#0d1319]">
          <PakistanMap
            selectedDistrictId={selected?.id ?? null}
            onSelectDistrict={handleSelectDistrict}
            onOpenTrend={handleOpenTrend}
          />
        </div>

        {selected && data && (
          <div className="w-[360px] shrink-0">
            <DrilldownPanel
              districtName={selected.name}
              provinceName={PROVINCE_NAMES[selected.province]}
              data={data}
              selectedBrandId={selectedBrandId}
              selectedVariantId={selectedVariantId}
              onSelectBrand={(id) => {
                setSelectedBrandId(id);
                setSelectedVariantId(null);
              }}
              onSelectVariant={setSelectedVariantId}
              onOpenTrend={() => setTrendOpen(true)}
              onClose={handleClosePanel}
            />
          </div>
        )}
      </div>

      <div className="px-5 pb-3 sm:hidden">
        <Legend />
      </div>

      {trendOpen && selected && data && (
        <TrendModal
          districtName={selected.name}
          provinceName={PROVINCE_NAMES[selected.province]}
          data={data}
          onClose={() => setTrendOpen(false)}
        />
      )}
    </main>
  );
}
