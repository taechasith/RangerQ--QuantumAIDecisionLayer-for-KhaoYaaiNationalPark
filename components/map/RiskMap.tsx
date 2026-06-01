"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import maplibregl, { type Map as MapLibreMap, type Popup } from "maplibre-gl";

import { riskMapFeatureCollection, type MapLayer, type RiskMapZone } from "@/lib/geo/geojson";

const layers: Array<{ id: MapLayer; label: string }> = [
  { id: "fire", label: "Fire Risk" },
  { id: "wildlife", label: "Wildlife Risk" },
  { id: "combined", label: "Combined Priority" },
  { id: "patrol", label: "Patrol Plan" },
];

const layerColors: Record<MapLayer, string> = {
  fire: "#dc2626",
  wildlife: "#7c3aed",
  combined: "#047857",
  patrol: "#0369a1",
};

function scoreForLayer(zone: RiskMapZone, layer: MapLayer) {
  if (layer === "fire") return zone.fireRisk;
  if (layer === "wildlife") return zone.wildlifeRisk;
  return zone.combinedPriority;
}

function riskFill(score: number) {
  if (score >= 80) return "bg-red-50 text-red-700 ring-red-200";
  if (score >= 65) return "bg-amber-50 text-amber-700 ring-amber-200";
  if (score >= 40) return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  return "bg-zinc-50 text-zinc-600 ring-zinc-200";
}

function popupHtml(properties: RiskMapZone & { score: number }) {
  const action = properties.recommendedAction.replaceAll("<", "&lt;").replaceAll(">", "&gt;");
  return `
    <div style="font-family: Arial, sans-serif; min-width: 220px;">
      <div style="font-weight: 700; color: #18181b;">${properties.code}</div>
      <div style="margin-top: 2px; color: #52525b;">${properties.name}</div>
      <div style="margin-top: 8px; font-weight: 700;">Score ${properties.score} · ${properties.label}</div>
      <div style="margin-top: 8px; color: #3f3f46;">${action}</div>
    </div>
  `;
}

export function RiskMap({
  zones,
  mapStyleUrl,
  hasRiskRun,
}: {
  zones: RiskMapZone[];
  mapStyleUrl: string;
  hasRiskRun: boolean;
}) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const popupRef = useRef<Popup | null>(null);
  const [layer, setLayer] = useState<MapLayer>("combined");
  const [threshold, setThreshold] = useState(0);
  const [zoneType, setZoneType] = useState("ALL");
  const [mapError, setMapError] = useState("");

  const zoneTypes = useMemo(() => ["ALL", ...Array.from(new Set(zones.map((zone) => zone.zoneType))).sort()], [zones]);
  const featureCollection = useMemo(
    () => riskMapFeatureCollection(zones, layer, threshold, zoneType),
    [zones, layer, threshold, zoneType],
  );
  const filteredZones = useMemo(
    () => zones
      .filter((zone) => scoreForLayer(zone, layer) >= threshold && (zoneType === "ALL" || zone.zoneType === zoneType))
      .sort((a, b) => scoreForLayer(b, layer) - scoreForLayer(a, layer)),
    [zones, layer, threshold, zoneType],
  );

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    let errorTimer: ReturnType<typeof setTimeout> | null = null;

    try {
      mapRef.current = new maplibregl.Map({
        container: mapContainerRef.current,
        style: mapStyleUrl,
        center: [101.42, 14.4],
        zoom: 9,
        attributionControl: false,
      });

      mapRef.current.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), "top-right");
      mapRef.current.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-right");

      mapRef.current.on("error", (event) => {
        const error = event.error instanceof Error ? event.error.message : "Map failed to load";
        setMapError(error);
      });
    } catch (error) {
      errorTimer = setTimeout(() => {
        setMapError(error instanceof Error ? error.message : "Map failed to initialize");
      }, 0);
    }

    return () => {
      if (errorTimer) clearTimeout(errorTimer);
      popupRef.current?.remove();
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [mapStyleUrl]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const applyData = () => {
      const source = map.getSource("risk-zones") as maplibregl.GeoJSONSource | undefined;
      if (source) {
        source.setData(featureCollection);
        return;
      }

      map.addSource("risk-zones", {
        type: "geojson",
        data: featureCollection,
      });
      map.addLayer({
        id: "risk-zone-halo",
        type: "circle",
        source: "risk-zones",
        paint: {
          "circle-radius": ["interpolate", ["linear"], ["get", "score"], 0, 10, 100, 32],
          "circle-color": layerColors[layer],
          "circle-opacity": 0.16,
          "circle-stroke-color": layerColors[layer],
          "circle-stroke-width": 1,
        },
      });
      map.addLayer({
        id: "risk-zone-core",
        type: "circle",
        source: "risk-zones",
        paint: {
          "circle-radius": ["interpolate", ["linear"], ["get", "score"], 0, 5, 100, 13],
          "circle-color": layerColors[layer],
          "circle-opacity": 0.9,
          "circle-stroke-color": "#ffffff",
          "circle-stroke-width": 2,
        },
      });

      map.on("click", "risk-zone-core", (event) => {
        const feature = event.features?.[0];
        if (!feature?.geometry || feature.geometry.type !== "Point") return;
        const coordinates = feature.geometry.coordinates as [number, number];
        const properties = feature.properties as RiskMapZone & { score: number };
        popupRef.current?.remove();
        popupRef.current = new maplibregl.Popup({ closeButton: true, maxWidth: "320px" })
          .setLngLat(coordinates)
          .setHTML(popupHtml(properties))
          .addTo(map);
      });

      map.on("mouseenter", "risk-zone-core", () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", "risk-zone-core", () => {
        map.getCanvas().style.cursor = "";
      });
    };

    if (map.isStyleLoaded()) {
      applyData();
    } else {
      map.once("load", applyData);
    }
  }, [featureCollection, layer]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.getLayer("risk-zone-core")) return;
    map.setPaintProperty("risk-zone-core", "circle-color", layerColors[layer]);
    map.setPaintProperty("risk-zone-halo", "circle-color", layerColors[layer]);
    map.setPaintProperty("risk-zone-halo", "circle-stroke-color", layerColors[layer]);
  }, [layer]);

  return (
    <div className="space-y-4">
      <section className="rounded-lg border border-zinc-200 bg-white p-4">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap gap-2">
            {layers.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setLayer(item.id)}
                className={`rounded-md border px-3 py-2 text-sm font-semibold ${
                  layer === item.id
                    ? "border-zinc-950 bg-zinc-950 text-white"
                    : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="grid gap-3 sm:grid-cols-[minmax(220px,1fr)_180px_auto_auto] sm:items-center">
            <label className="text-sm font-medium text-zinc-700">
              Risk threshold
              <span className="ml-2 font-semibold text-zinc-950">{threshold}</span>
              <input
                className="mt-2 w-full accent-emerald-700"
                type="range"
                min="0"
                max="100"
                step="5"
                value={threshold}
                onChange={(event) => setThreshold(Number(event.target.value))}
              />
            </label>
            <label className="text-sm font-medium text-zinc-700">
              Zone type
              <select
                className="mt-2 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm"
                value={zoneType}
                onChange={(event) => setZoneType(event.target.value)}
              >
                {zoneTypes.map((type) => (
                  <option key={type} value={type}>{type === "ALL" ? "All zones" : type}</option>
                ))}
              </select>
            </label>
            <Link href="/dashboard" className="rounded-md bg-emerald-700 px-4 py-2 text-center text-sm font-semibold text-white">
              Run risk scoring
            </Link>
            <Link href="/optimizer" className="rounded-md border border-zinc-200 px-4 py-2 text-center text-sm font-semibold text-zinc-700 hover:bg-zinc-50">
              Run optimization
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
          <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3">
            <h2 className="font-semibold text-zinc-950">Khao Yai risk layer</h2>
            <span className="text-sm text-zinc-500">{featureCollection.features.length} zones visible</span>
          </div>
          <div className="relative h-[560px] min-h-[420px]">
            <div ref={mapContainerRef} className="absolute inset-0" aria-label="Khao Yai risk map" />
            {mapError ? (
              <div className="absolute inset-0 grid place-items-center bg-white/95 p-6 text-center">
                <div>
                  <p className="font-semibold text-zinc-950">Map unavailable</p>
                  <p className="mt-2 text-sm leading-6 text-zinc-600">{mapError}</p>
                  <p className="mt-2 text-sm text-zinc-500">Use the low-bandwidth zone table below.</p>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <aside className="rounded-lg border border-zinc-200 bg-white">
          <div className="border-b border-zinc-200 px-4 py-3">
            <h2 className="font-semibold text-zinc-950">Selected layer</h2>
            <p className="mt-1 text-sm text-zinc-600">
              {hasRiskRun ? "Latest explainable risk scores are active." : "Base risk fallback is active until risk scoring is run."}
            </p>
          </div>
          <div className="divide-y divide-zinc-100">
            {filteredZones.slice(0, 6).map((zone) => {
              const score = scoreForLayer(zone, layer);
              return (
                <div key={zone.id} className="px-4 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-zinc-950">{zone.code}</p>
                      <p className="text-sm text-zinc-600">{zone.name}</p>
                    </div>
                    <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${riskFill(score)}`}>{score}</span>
                  </div>
                  <p className="mt-2 text-sm leading-5 text-zinc-600">{zone.recommendedAction}</p>
                </div>
              );
            })}
          </div>
        </aside>
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white">
        <div className="border-b border-zinc-200 px-5 py-4">
          <h2 className="font-semibold text-zinc-950">Low-bandwidth zone table</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 text-zinc-600">
              <tr>
                <th className="px-5 py-3">Code</th>
                <th className="px-5 py-3">Zone</th>
                <th className="px-5 py-3">Type</th>
                <th className="px-5 py-3">Fire</th>
                <th className="px-5 py-3">Wildlife</th>
                <th className="px-5 py-3">Combined</th>
                <th className="px-5 py-3">Recommended action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredZones.map((zone) => (
                <tr key={zone.id}>
                  <td className="px-5 py-3 font-medium text-zinc-950">{zone.code}</td>
                  <td className="px-5 py-3 text-zinc-700">{zone.name}</td>
                  <td className="px-5 py-3 text-zinc-700">{zone.zoneType}</td>
                  <td className="px-5 py-3 text-zinc-700">{zone.fireRisk}</td>
                  <td className="px-5 py-3 text-zinc-700">{zone.wildlifeRisk}</td>
                  <td className="px-5 py-3 font-semibold text-zinc-950">{zone.combinedPriority}</td>
                  <td className="min-w-[320px] px-5 py-3 text-zinc-700">{zone.recommendedAction}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {zones.some((zone) => zone.isSynthetic) ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Demo zones are synthetic. Replace with official park GIS data before operational use.
        </p>
      ) : null}
    </div>
  );
}
