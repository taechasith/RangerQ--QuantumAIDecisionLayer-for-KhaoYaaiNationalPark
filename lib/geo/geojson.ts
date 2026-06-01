import type { RiskScoreRow, ZoneRow } from "@/lib/rangerqData";

export type MapLayer = "fire" | "wildlife" | "combined" | "patrol";

export type RiskMapZone = {
  id: string;
  code: string;
  name: string;
  zoneType: string;
  lat: number;
  lng: number;
  areaHectares: number;
  fireRisk: number;
  wildlifeRisk: number;
  combinedPriority: number;
  label: string;
  topFactors: string;
  recommendedAction: string;
  freshnessWarning: string;
  isSynthetic: boolean;
};

export type RiskMapFeatureProperties = RiskMapZone & {
  score: number;
};

type PointFeature = {
  type: "Feature";
  geometry: {
    type: "Point";
    coordinates: [number, number];
  };
  properties: RiskMapFeatureProperties;
};

type PointFeatureCollection = {
  type: "FeatureCollection";
  features: PointFeature[];
};

function scoreLabel(score: number) {
  if (score >= 80) return "severe";
  if (score >= 65) return "high";
  if (score >= 40) return "medium";
  return "low";
}

function scoreForLayer(zone: RiskMapZone, layer: MapLayer) {
  if (layer === "fire") return zone.fireRisk;
  if (layer === "wildlife") return zone.wildlifeRisk;
  if (layer === "patrol") return zone.combinedPriority;
  return zone.combinedPriority;
}

export function buildRiskMapZones(zones: ZoneRow[], riskScores: RiskScoreRow[]): RiskMapZone[] {
  const scoreByZoneId = new Map(riskScores.map((score) => [score.zoneId, score]));

  return zones
    .filter((zone) => Number.isFinite(zone.centroidLat) && Number.isFinite(zone.centroidLng))
    .map((zone) => {
      const score = scoreByZoneId.get(zone.id);
      const combinedPriority = score?.combinedPriority ?? Math.round((zone.baseFireRisk + zone.baseWildlifeRisk) / 2);

      return {
        id: zone.id,
        code: zone.code,
        name: zone.name,
        zoneType: zone.zoneType,
        lat: zone.centroidLat,
        lng: zone.centroidLng,
        areaHectares: zone.areaHectares,
        fireRisk: score?.fireRisk ?? zone.baseFireRisk,
        wildlifeRisk: score?.wildlifeRisk ?? zone.baseWildlifeRisk,
        combinedPriority,
        label: score?.label ?? scoreLabel(combinedPriority),
        topFactors: score?.topFactors.map((factor) => `${factor.name} ${factor.score}`).join(", ") || "Base zone risk",
        recommendedAction: score?.recommendedAction || "Run risk scoring for explainable recommended action.",
        freshnessWarning: score?.freshnessWarning || "Using base risk until latest risk scoring is run.",
        isSynthetic: Boolean(zone.isSynthetic),
      };
    });
}

export function riskMapFeatureCollection(
  zones: RiskMapZone[],
  layer: MapLayer,
  threshold: number,
  zoneType: string,
): PointFeatureCollection {
  const filtered = zones.filter((zone) => {
    const score = scoreForLayer(zone, layer);
    return score >= threshold && (zoneType === "ALL" || zone.zoneType === zoneType);
  });

  return {
    type: "FeatureCollection",
    features: filtered.map((zone): PointFeature => ({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [zone.lng, zone.lat],
      },
      properties: {
        ...zone,
        score: scoreForLayer(zone, layer),
      },
    })),
  };
}
