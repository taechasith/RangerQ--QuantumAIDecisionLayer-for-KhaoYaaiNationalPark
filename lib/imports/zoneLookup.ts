import { GoogleSheetsStore } from "@/lib/adapters/googleSheets";

type ZoneRecord = {
  id?: string;
  code?: string;
};

export async function createZoneLookup(store: GoogleSheetsStore) {
  const zones = await store.list<ZoneRecord>("Zone");
  const byCode = new Map<string, string>();

  for (const zone of zones) {
    if (zone.code && zone.id) byCode.set(String(zone.code), String(zone.id));
  }

  return {
    byCode(code: string) {
      return byCode.get(code) || "";
    },
    nearestFallback() {
      return "";
    },
  };
}
