"use client";

import { geoIdentity, geoPath } from "d3-geo";
import { useMemo, useRef, useState } from "react";
import { competitivenessColor } from "@/lib/colorScale";
import { generateDistrictData } from "@/lib/mockData";
import { useGeoData, type DistrictFeature, type ProvinceFeature } from "@/lib/useGeoData";
import { PROVINCE_NAMES, type DistrictProperties } from "@/lib/types";

// Matches Pakistan's actual lon/lat bounding-box aspect ratio (~1.28:1, wider
// than tall) so the fitted map fills the viewBox with minimal internal
// padding, instead of a portrait box that left large empty margins.
const VIEW_W = 960;
const VIEW_H = 750;
const DOUBLE_CLICK_WINDOW_MS = 240;

interface TooltipState {
  x: number;
  y: number;
  name: string;
  province: string;
  competitiveness: number;
  brandCount: number;
}

interface PakistanMapProps {
  selectedDistrictId: string | null;
  onSelectDistrict: (props: DistrictProperties) => void;
  onOpenTrend: (props: DistrictProperties) => void;
}

export default function PakistanMap({
  selectedDistrictId,
  onSelectDistrict,
  onOpenTrend,
}: PakistanMapProps) {
  const { districts, provinces, error } = useGeoData();
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const clickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const { districtPaths, provincePaths } = useMemo(() => {
    if (!districts || !provinces) return { districtPaths: null, provincePaths: null };

    const fc = {
      type: "FeatureCollection" as const,
      features: districts as unknown as GeoJSON.Feature[],
    };
    // geoIdentity (plain planar projection) is used instead of geoMercator: for
    // this dataset, geoMercator's antimeridian-clipping stream misinterprets some
    // districts' ring winding and injects a phantom full-canvas rectangle into
    // their path. geoIdentity skips that spherical-clipping code path entirely,
    // and at Pakistan's latitude range (~24-37N) the Mercator/equirectangular
    // visual difference is negligible for a choropleth like this.
    const projection = geoIdentity().reflectY(true).fitSize([VIEW_W, VIEW_H], fc as GeoJSON.FeatureCollection);
    const pathGen = geoPath(projection);

    const dPaths = (districts as DistrictFeature[]).map((f) => ({
      id: f.properties.id,
      name: f.properties.name,
      province: f.properties.province,
      d: pathGen(f.geometry as GeoJSON.Geometry) ?? "",
    }));

    const pPaths = (provinces as ProvinceFeature[]).map((f) => ({
      id: f.properties.id,
      d: pathGen(f.geometry as GeoJSON.Geometry) ?? "",
    }));

    return { districtPaths: dPaths, provincePaths: pPaths };
  }, [districts, provinces]);

  function handleMouseMove(
    e: React.MouseEvent<SVGPathElement>,
    name: string,
    province: string,
    competitiveness: number,
    brandCount: number
  ) {
    const bounds = containerRef.current?.getBoundingClientRect();
    if (!bounds) return;
    setTooltip({
      x: e.clientX - bounds.left,
      y: e.clientY - bounds.top,
      name,
      province,
      competitiveness,
      brandCount,
    });
  }

  function handleClick(props: DistrictProperties) {
    if (clickTimer.current) clearTimeout(clickTimer.current);
    clickTimer.current = setTimeout(() => {
      onSelectDistrict(props);
      clickTimer.current = null;
    }, DOUBLE_CLICK_WINDOW_MS);
  }

  function handleDoubleClick(props: DistrictProperties) {
    if (clickTimer.current) {
      clearTimeout(clickTimer.current);
      clickTimer.current = null;
    }
    onSelectDistrict(props);
    onOpenTrend(props);
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-red-400">
        Failed to load map data: {error}
      </div>
    );
  }

  if (!districtPaths || !provincePaths) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-ink-600">
        <div className="animate-pulse text-slate-400">Loading map…</div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative h-full w-full">
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        className="h-full w-full select-none"
        role="img"
        aria-label="Pakistan district competitiveness heatmap"
      >
        <g>
          {districtPaths.map((d) => {
            const data = generateDistrictData(d.id, d.name, d.province);
            return (
              <path
                key={d.id}
                d={d.d}
                className={`district-shape${d.id === selectedDistrictId ? " is-selected" : ""}`}
                fill={competitivenessColor(data.competitiveness)}
                onMouseMove={(e) =>
                  handleMouseMove(
                    e,
                    d.name,
                    PROVINCE_NAMES[d.province] ?? d.province,
                    data.competitiveness,
                    data.totalBrandCount
                  )
                }
                onMouseLeave={() => setTooltip(null)}
                onClick={() => handleClick({ id: d.id, name: d.name, province: d.province })}
                onDoubleClick={() => handleDoubleClick({ id: d.id, name: d.name, province: d.province })}
              >
                <title>{d.name}</title>
              </path>
            );
          })}
        </g>
        <g>
          {provincePaths.map((p) => (
            <path key={p.id} d={p.d} className="province-outline" />
          ))}
        </g>
      </svg>

      {tooltip && (
        <div
          className="pointer-events-none absolute z-10 min-w-[190px] rounded-lg border border-white/10 bg-[#0d1319]/95 px-3 py-2 text-xs shadow-panel"
          style={{
            left: Math.min(tooltip.x + 14, (containerRef.current?.clientWidth ?? 0) - 200),
            top: tooltip.y + 14,
          }}
        >
          <div className="text-sm font-semibold text-slate-100">{tooltip.name}</div>
          <div className="text-slate-400">{tooltip.province}</div>
          <div className="mt-1.5 flex items-center justify-between gap-4">
            <span className="text-slate-400">Competitiveness</span>
            <span className="font-medium text-slate-100">{tooltip.competitiveness}/100</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-400">Active brands</span>
            <span className="font-medium text-slate-100">{tooltip.brandCount}</span>
          </div>
          <div className="mt-1.5 text-[10px] text-slate-500">Click for brands · double-click for trend</div>
        </div>
      )}
    </div>
  );
}
