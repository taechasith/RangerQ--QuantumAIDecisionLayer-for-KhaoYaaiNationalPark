import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "bcryptjs";
import dotenv from "dotenv";

import { DataSourceType, PrismaClient, ZoneType } from "../lib/generated/prisma/client";

dotenv.config({ path: ".env.local" });
dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required to seed RangerQ");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

type SeedZone = {
  code: string;
  name: string;
  zoneType: ZoneType;
  lat: number;
  lng: number;
  areaHectares: number;
  baseFireRisk: number;
  baseWildlifeRisk: number;
  accessDifficulty: number;
  rangerStationDistanceKm: number;
};

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

const zones: SeedZone[] = [
  { code: "KY-BND-01", name: "Northwest Boundary Corridor", zoneType: ZoneType.BOUNDARY, lat: 14.52, lng: 101.32, areaHectares: 420, baseFireRisk: 72, baseWildlifeRisk: 58, accessDifficulty: 46, rangerStationDistanceKm: 7.4 },
  { code: "KY-BND-02", name: "Pak Chong Village Edge", zoneType: ZoneType.VILLAGE_EDGE, lat: 14.48, lng: 101.37, areaHectares: 310, baseFireRisk: 84, baseWildlifeRisk: 76, accessDifficulty: 34, rangerStationDistanceKm: 4.2 },
  { code: "KY-FOR-03", name: "Dry Dipterocarp Ridge", zoneType: ZoneType.FOREST, lat: 14.44, lng: 101.35, areaHectares: 680, baseFireRisk: 79, baseWildlifeRisk: 45, accessDifficulty: 68, rangerStationDistanceKm: 9.1 },
  { code: "KY-TRL-04", name: "Haew Suwat Trail Sector", zoneType: ZoneType.TRAIL, lat: 14.43, lng: 101.42, areaHectares: 260, baseFireRisk: 54, baseWildlifeRisk: 64, accessDifficulty: 38, rangerStationDistanceKm: 5.6 },
  { code: "KY-VIS-05", name: "Visitor Center Pressure Zone", zoneType: ZoneType.VISITOR_AREA, lat: 14.44, lng: 101.38, areaHectares: 150, baseFireRisk: 62, baseWildlifeRisk: 52, accessDifficulty: 20, rangerStationDistanceKm: 1.1 },
  { code: "KY-RD-06", name: "Thanarat Road Wildlife Crossing", zoneType: ZoneType.ROAD, lat: 14.41, lng: 101.39, areaHectares: 190, baseFireRisk: 48, baseWildlifeRisk: 82, accessDifficulty: 28, rangerStationDistanceKm: 3.5 },
  { code: "KY-WAT-07", name: "Lam Takhong Water Source", zoneType: ZoneType.WATER_SOURCE, lat: 14.39, lng: 101.44, areaHectares: 230, baseFireRisk: 35, baseWildlifeRisk: 78, accessDifficulty: 42, rangerStationDistanceKm: 6.8 },
  { code: "KY-FOR-08", name: "Central Evergreen Interior", zoneType: ZoneType.FOREST, lat: 14.35, lng: 101.45, areaHectares: 940, baseFireRisk: 44, baseWildlifeRisk: 69, accessDifficulty: 75, rangerStationDistanceKm: 11.2 },
  { code: "KY-BND-09", name: "Southern Farm Interface", zoneType: ZoneType.VILLAGE_EDGE, lat: 14.28, lng: 101.43, areaHectares: 360, baseFireRisk: 81, baseWildlifeRisk: 88, accessDifficulty: 52, rangerStationDistanceKm: 8.9 },
  { code: "KY-RS-10", name: "Nang Rong Ranger Station", zoneType: ZoneType.RANGER_STATION, lat: 14.31, lng: 101.37, areaHectares: 80, baseFireRisk: 37, baseWildlifeRisk: 40, accessDifficulty: 16, rangerStationDistanceKm: 0.0 },
  { code: "KY-BND-11", name: "Eastern Boundary Firebreak", zoneType: ZoneType.BOUNDARY, lat: 14.37, lng: 101.56, areaHectares: 410, baseFireRisk: 86, baseWildlifeRisk: 55, accessDifficulty: 57, rangerStationDistanceKm: 10.7 },
  { code: "KY-TRL-12", name: "Khao Khieo Trail Approach", zoneType: ZoneType.TRAIL, lat: 14.46, lng: 101.49, areaHectares: 280, baseFireRisk: 51, baseWildlifeRisk: 61, accessDifficulty: 64, rangerStationDistanceKm: 7.9 },
  { code: "KY-FOR-13", name: "Northeast Forest Block", zoneType: ZoneType.FOREST, lat: 14.55, lng: 101.51, areaHectares: 760, baseFireRisk: 66, baseWildlifeRisk: 57, accessDifficulty: 71, rangerStationDistanceKm: 12.1 },
  { code: "KY-WAT-14", name: "Mo Singto Wetland Fringe", zoneType: ZoneType.WATER_SOURCE, lat: 14.47, lng: 101.44, areaHectares: 210, baseFireRisk: 29, baseWildlifeRisk: 84, accessDifficulty: 39, rangerStationDistanceKm: 5.3 },
  { code: "KY-RD-15", name: "Night Crossing Road Bend", zoneType: ZoneType.ROAD, lat: 14.34, lng: 101.49, areaHectares: 170, baseFireRisk: 43, baseWildlifeRisk: 90, accessDifficulty: 31, rangerStationDistanceKm: 6.6 },
  { code: "KY-BND-16", name: "Western Smoke Report Zone", zoneType: ZoneType.BOUNDARY, lat: 14.38, lng: 101.27, areaHectares: 500, baseFireRisk: 91, baseWildlifeRisk: 49, accessDifficulty: 62, rangerStationDistanceKm: 10.2 },
  { code: "KY-VIS-17", name: "Campground Visitor Cluster", zoneType: ZoneType.VISITOR_AREA, lat: 14.42, lng: 101.46, areaHectares: 120, baseFireRisk: 68, baseWildlifeRisk: 63, accessDifficulty: 22, rangerStationDistanceKm: 2.8 },
  { code: "KY-FOR-18", name: "Remote Southeast Forest", zoneType: ZoneType.FOREST, lat: 14.21, lng: 101.53, areaHectares: 820, baseFireRisk: 59, baseWildlifeRisk: 70, accessDifficulty: 82, rangerStationDistanceKm: 14.4 },
  { code: "KY-BND-19", name: "Elephant Conflict Boundary", zoneType: ZoneType.VILLAGE_EDGE, lat: 14.25, lng: 101.34, areaHectares: 390, baseFireRisk: 73, baseWildlifeRisk: 94, accessDifficulty: 48, rangerStationDistanceKm: 8.1 },
  { code: "KY-RS-20", name: "Northern Patrol Base", zoneType: ZoneType.RANGER_STATION, lat: 14.5, lng: 101.41, areaHectares: 95, baseFireRisk: 41, baseWildlifeRisk: 46, accessDifficulty: 18, rangerStationDistanceKm: 0.0 },
];

async function main() {
  const password = process.env.DEMO_ADMIN_PASSWORD || "change-this-password";
  const email = process.env.DEMO_ADMIN_EMAIL || "admin@rangerq.local";
  const passwordHash = await hash(password, 12);

  const park = await prisma.park.upsert({
    where: { id: "khao-yai-national-park" },
    update: {
      name: "Khao Yai National Park",
      notes: "Operational demo seeded with synthetic zones. Replace with official GIS and field data before real use.",
    },
    create: {
      id: "khao-yai-national-park",
      name: "Khao Yai National Park",
      boundaryGeojson: {
        type: "FeatureCollection",
        features: [],
        synthetic: true,
        warning: "Official Khao Yai boundary not included in demo seed.",
      },
      notes: "Operational demo seeded with synthetic zones. Replace with official GIS and field data before real use.",
    },
  });

  await prisma.user.upsert({
    where: { email },
    update: { passwordHash, name: "RangerQ Admin", role: "ADMIN" },
    create: { email, name: "RangerQ Admin", passwordHash, role: "ADMIN" },
  });

  for (const zone of zones) {
    const { lat, lng, ...zoneData } = zone;

    await prisma.zone.upsert({
      where: { code: zone.code },
      update: {
        ...zoneData,
        parkId: park.id,
        geometryGeojson: pointGeometry(lat, lng),
        centroidLat: lat,
        centroidLng: lng,
        isSynthetic: true,
        notes: "Synthetic demo zone. Replace with official Khao Yai GIS polygon.",
      },
      create: {
        ...zoneData,
        parkId: park.id,
        geometryGeojson: pointGeometry(lat, lng),
        centroidLat: lat,
        centroidLng: lng,
        isSynthetic: true,
        notes: "Synthetic demo zone. Replace with official Khao Yai GIS polygon.",
      },
    });
  }

  const sources = [
    { type: DataSourceType.SMART_EXPORT, name: "SMART patrol export", status: "demo" },
    { type: DataSourceType.CAMERA_AI, name: "Camera and AI detections", status: "demo" },
    { type: DataSourceType.VISITOR_CSV, name: "Visitor pressure CSV", status: "demo" },
    { type: DataSourceType.OPEN_METEO, name: "Open-Meteo weather", status: "configured" },
  ];

  for (const source of sources) {
    await prisma.dataSource.upsert({
      where: { parkId_type: { parkId: park.id, type: source.type } },
      update: {
        name: source.name,
        status: source.status,
        freshnessWarning: source.status === "demo" ? "Demo data source until official data is imported." : null,
      },
      create: {
        parkId: park.id,
        type: source.type,
        name: source.name,
        status: source.status,
        freshnessWarning: source.status === "demo" ? "Demo data source until official data is imported." : null,
      },
    });
  }

  await prisma.auditLog.create({
    data: {
      action: "SEED_DEMO_DATA",
      entity: "Park",
      entityId: park.id,
      metadata: {
        zones: zones.length,
        synthetic: true,
      },
    },
  });

  console.log(`Seeded ${park.name}: ${zones.length} synthetic zones, admin ${email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
