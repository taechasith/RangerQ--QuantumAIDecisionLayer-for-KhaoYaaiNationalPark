import { GoogleSheetsStore } from "@/lib/adapters/googleSheets";
import { importId } from "@/lib/imports/csv";

type ZoneForWeather = {
  id?: string;
  code?: string;
  centroidLat?: string | number;
  centroidLng?: string | number;
};

type OpenMeteoHourly = {
  time?: string[];
  temperature_2m?: number[];
  relative_humidity_2m?: number[];
  wind_speed_10m?: number[];
  wind_direction_10m?: number[];
  wind_gusts_10m?: number[];
  precipitation?: number[];
  soil_moisture_0_to_1cm?: number[];
  soil_moisture_1_to_3cm?: number[];
};

type OpenMeteoResponse = {
  hourly?: OpenMeteoHourly;
};

const hourlyVariables = [
  "temperature_2m",
  "relative_humidity_2m",
  "wind_speed_10m",
  "wind_direction_10m",
  "wind_gusts_10m",
  "precipitation",
  "soil_moisture_0_to_1cm",
  "soil_moisture_1_to_3cm",
].join(",");

function numberOrZero(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

async function fetchZoneWeather(zone: ZoneForWeather) {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(zone.centroidLat));
  url.searchParams.set("longitude", String(zone.centroidLng));
  url.searchParams.set("hourly", hourlyVariables);
  url.searchParams.set("forecast_hours", "1");
  url.searchParams.set("timezone", "Asia/Bangkok");

  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Open-Meteo request failed for ${zone.code}: ${response.status}`);
  }

  const payload = await response.json() as OpenMeteoResponse;
  const hourly = payload.hourly || {};
  return {
    id: importId(`weather-${zone.code || zone.id || "zone"}`),
    zoneId: String(zone.id || ""),
    timestamp: hourly.time?.[0] ? new Date(hourly.time[0]).toISOString() : new Date().toISOString(),
    temperature2m: hourly.temperature_2m?.[0] ?? "",
    relativeHumidity2m: hourly.relative_humidity_2m?.[0] ?? "",
    windSpeed10m: hourly.wind_speed_10m?.[0] ?? "",
    windDirection10m: hourly.wind_direction_10m?.[0] ?? "",
    windGusts10m: hourly.wind_gusts_10m?.[0] ?? "",
    precipitation: hourly.precipitation?.[0] ?? "",
    soilMoisture0To1cm: hourly.soil_moisture_0_to_1cm?.[0] ?? "",
    soilMoisture1To3cm: hourly.soil_moisture_1_to_3cm?.[0] ?? "",
    raw: payload,
    createdAt: new Date().toISOString(),
  };
}

export async function syncOpenMeteoWeather(store: GoogleSheetsStore) {
  const zones = await store.list<ZoneForWeather>("Zone");
  const usableZones = zones.filter((zone) => zone.id && zone.centroidLat && zone.centroidLng);
  const rows = [];

  for (const zone of usableZones) {
    rows.push(await fetchZoneWeather(zone));
  }

  for (const row of rows) {
    await store.append("WeatherSnapshot", row);
  }

  await store.upsert("DataSource", {
    id: "source-weather",
    parkId: "khao-yai-national-park",
    type: "OPEN_METEO",
    name: "Open-Meteo weather",
    status: "configured",
    lastSyncedAt: new Date().toISOString(),
    freshnessWarning: "",
    config: { variables: hourlyVariables.split(",") },
    updatedAt: new Date().toISOString(),
  });

  await store.append("AuditLog", {
    id: importId("audit-weather"),
    userId: "",
    action: "SYNC_OPEN_METEO",
    entity: "WeatherSnapshot",
    entityId: "",
    metadata: { records: rows.length },
    createdAt: new Date().toISOString(),
  });

  return { records: rows.length };
}

export function demoWeatherSnapshot(zone: ZoneForWeather) {
  return {
    zoneId: String(zone.id || ""),
    temperature2m: 31,
    relativeHumidity2m: 64,
    windSpeed10m: 9,
    precipitation: 0,
    drynessScore: numberOrZero(zone.centroidLat) > 14.4 ? 0.7 : 0.5,
  };
}
