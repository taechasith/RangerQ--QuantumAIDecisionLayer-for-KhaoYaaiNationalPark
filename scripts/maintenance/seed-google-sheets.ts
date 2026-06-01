import dotenv from "dotenv";

import { GoogleSheetsStore } from "../../lib/adapters/googleSheets";

dotenv.config({ path: ".env.local" });
dotenv.config();

const now = "2026-05-31T00:00:00+07:00";

const zones = [
  ["zone-ky-bnd-01", "KY-BND-01", "Northwest Boundary Corridor", "BOUNDARY", 14.52, 101.32, 420, 72, 58, 46, 7.4],
  ["zone-ky-bnd-02", "KY-BND-02", "Pak Chong Village Edge", "VILLAGE_EDGE", 14.48, 101.37, 310, 84, 76, 34, 4.2],
  ["zone-ky-for-03", "KY-FOR-03", "Dry Dipterocarp Ridge", "FOREST", 14.44, 101.35, 680, 79, 45, 68, 9.1],
  ["zone-ky-trl-04", "KY-TRL-04", "Haew Suwat Trail Sector", "TRAIL", 14.43, 101.42, 260, 54, 64, 38, 5.6],
  ["zone-ky-vis-05", "KY-VIS-05", "Visitor Center Pressure Zone", "VISITOR_AREA", 14.44, 101.38, 150, 62, 52, 20, 1.1],
  ["zone-ky-rd-06", "KY-RD-06", "Thanarat Road Wildlife Crossing", "ROAD", 14.41, 101.39, 190, 48, 82, 28, 3.5],
  ["zone-ky-wat-07", "KY-WAT-07", "Lam Takhong Water Source", "WATER_SOURCE", 14.39, 101.44, 230, 35, 78, 42, 6.8],
  ["zone-ky-for-08", "KY-FOR-08", "Central Evergreen Interior", "FOREST", 14.35, 101.45, 940, 44, 69, 75, 11.2],
  ["zone-ky-bnd-09", "KY-BND-09", "Southern Farm Interface", "VILLAGE_EDGE", 14.28, 101.43, 360, 81, 88, 52, 8.9],
  ["zone-ky-rs-10", "KY-RS-10", "Nang Rong Ranger Station", "RANGER_STATION", 14.31, 101.37, 80, 37, 40, 16, 0],
  ["zone-ky-bnd-11", "KY-BND-11", "Eastern Boundary Firebreak", "BOUNDARY", 14.37, 101.56, 410, 86, 55, 57, 10.7],
  ["zone-ky-trl-12", "KY-TRL-12", "Khao Khieo Trail Approach", "TRAIL", 14.46, 101.49, 280, 51, 61, 64, 7.9],
  ["zone-ky-for-13", "KY-FOR-13", "Northeast Forest Block", "FOREST", 14.55, 101.51, 760, 66, 57, 71, 12.1],
  ["zone-ky-wat-14", "KY-WAT-14", "Mo Singto Wetland Fringe", "WATER_SOURCE", 14.47, 101.44, 210, 29, 84, 39, 5.3],
  ["zone-ky-rd-15", "KY-RD-15", "Night Crossing Road Bend", "ROAD", 14.34, 101.49, 170, 43, 90, 31, 6.6],
  ["zone-ky-bnd-16", "KY-BND-16", "Western Smoke Report Zone", "BOUNDARY", 14.38, 101.27, 500, 91, 49, 62, 10.2],
  ["zone-ky-vis-17", "KY-VIS-17", "Campground Visitor Cluster", "VISITOR_AREA", 14.42, 101.46, 120, 68, 63, 22, 2.8],
  ["zone-ky-for-18", "KY-FOR-18", "Remote Southeast Forest", "FOREST", 14.21, 101.53, 820, 59, 70, 82, 14.4],
  ["zone-ky-bnd-19", "KY-BND-19", "Elephant Conflict Boundary", "VILLAGE_EDGE", 14.25, 101.34, 390, 73, 94, 48, 8.1],
  ["zone-ky-rs-20", "KY-RS-20", "Northern Patrol Base", "RANGER_STATION", 14.5, 101.41, 95, 41, 46, 18, 0],
] as const;

function pointGeometry(lat: number, lng: number) {
  return {
    type: "Feature",
    properties: {
      synthetic: true,
      warning: "Demo point geometry. Replace with official Khao Yai GIS polygons before operational use.",
    },
    geometry: {
      type: "Point",
      coordinates: [lng, lat],
    },
  };
}

async function main() {
  const store = new GoogleSheetsStore();

  await store.upsert("Park", {
    id: "khao-yai-national-park",
    name: "Khao Yai National Park",
    country: "Thailand",
    timezone: "Asia/Bangkok",
    boundaryGeojson: { type: "FeatureCollection", features: [], synthetic: true },
    notes: "Operational demo seeded with synthetic zones. Replace with official GIS and field data before real use.",
    createdAt: now,
    updatedAt: now,
  });

  await store.upsert("User", {
    id: "admin-user",
    email: process.env.DEMO_ADMIN_EMAIL || "admin@rangerq.local",
    name: "RangerQ Admin",
    passwordHash: "managed-in-app-or-apps-script",
    role: "ADMIN",
    createdAt: now,
    updatedAt: now,
  });

  for (const [id, code, name, zoneType, lat, lng, areaHectares, baseFireRisk, baseWildlifeRisk, accessDifficulty, rangerStationDistanceKm] of zones) {
    await store.upsert("Zone", {
      id,
      parkId: "khao-yai-national-park",
      code,
      name,
      zoneType,
      geometryGeojson: pointGeometry(lat, lng),
      centroidLat: lat,
      centroidLng: lng,
      areaHectares,
      baseFireRisk,
      baseWildlifeRisk,
      accessDifficulty,
      rangerStationDistanceKm,
      isSynthetic: true,
      notes: "Synthetic demo zone. Replace with official Khao Yai GIS polygon.",
      createdAt: now,
      updatedAt: now,
    });
  }

  for (const source of [
    ["source-smart", "SMART_EXPORT", "SMART patrol export", "demo"],
    ["source-camera", "CAMERA_AI", "Camera and AI detections", "demo"],
    ["source-visitors", "VISITOR_CSV", "Visitor pressure CSV", "demo"],
    ["source-firms", "NASA_FIRMS", "NASA FIRMS fire hotspots", "demo"],
    ["source-weather", "OPEN_METEO", "Open-Meteo weather", "configured"],
  ] as const) {
    await store.upsert("DataSource", {
      id: source[0],
      parkId: "khao-yai-national-park",
      type: source[1],
      name: source[2],
      status: source[3],
      lastSyncedAt: "",
      freshnessWarning: source[3] === "demo" ? "Demo data source until official data is imported." : "",
      config: {},
      createdAt: now,
      updatedAt: now,
    });
  }

  await store.upsert("AuditLog", {
    id: "audit-seed-demo-data",
    userId: "",
    action: "SEED_DEMO_DATA",
    entity: "Park",
    entityId: "khao-yai-national-park",
    metadata: { zones: zones.length, synthetic: true },
    createdAt: now,
  });

  console.log(`Seeded Google Sheets backend with ${zones.length} zones.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
