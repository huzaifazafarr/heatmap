"use client";

import { useEffect, useState } from "react";
import type { DistrictProperties, ProvinceProperties } from "./types";

export interface DistrictFeature {
  type: "Feature";
  properties: DistrictProperties;
  geometry: GeoJSON.Geometry;
}

export interface ProvinceFeature {
  type: "Feature";
  properties: ProvinceProperties;
  geometry: GeoJSON.Geometry;
}

interface GeoState {
  districts: DistrictFeature[] | null;
  provinces: ProvinceFeature[] | null;
  error: string | null;
}

/** Loads the district and province boundary files from /public/data once. */
export function useGeoData(): GeoState {
  const [state, setState] = useState<GeoState>({
    districts: null,
    provinces: null,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch("/data/districts.geojson").then((r) => r.json()),
      fetch("/data/provinces.geojson").then((r) => r.json()),
    ])
      .then(([districtsFc, provincesFc]) => {
        if (cancelled) return;
        setState({
          districts: districtsFc.features,
          provinces: provincesFc.features,
          error: null,
        });
      })
      .catch((err) => {
        if (cancelled) return;
        setState({ districts: null, provinces: null, error: String(err) });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
