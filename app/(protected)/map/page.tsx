import { PageHeader } from "@/components/layout/PageHeader";
import { RiskMap } from "@/components/map/RiskMap";
import { buildRiskMapZones } from "@/lib/geo/geojson";
import { getOperationsSnapshot } from "@/lib/rangerqData";

export const dynamic = "force-dynamic";

export default async function MapPage() {
  const { zones, riskScores, riskRun } = await getOperationsSnapshot();
  const mapZones = buildRiskMapZones(zones, riskScores);

  const envStyleUrl = process.env.MAP_STYLE_URL || "";
  const cleanedUrl = envStyleUrl.trim().replace(/^['"]|['"]$/g, "");
  const isDemoTiles = !cleanedUrl || cleanedUrl.includes("demotiles.maplibre.org");

  const mapStyleUrl = isDemoTiles
    ? "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
    : cleanedUrl;

  return (
    <>
      <PageHeader
        title="Interactive Map"
        description="Interactive digital twin map. Visualizes fire threats, wildlife movement, and patrol assignments across Khao Yai."
      />
      <RiskMap
        zones={mapZones}
        mapStyleUrl={mapStyleUrl}
        hasRiskRun={Boolean(riskRun)}
      />
    </>
  );
}
