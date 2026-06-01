import { PageHeader } from "@/components/layout/PageHeader";
import { RiskMap } from "@/components/map/RiskMap";
import { buildRiskMapZones } from "@/lib/geo/geojson";
import { getOperationsSnapshot } from "@/lib/rangerqData";

export const dynamic = "force-dynamic";

export default async function MapPage() {
  const { zones, riskScores, riskRun } = await getOperationsSnapshot();
  const mapZones = buildRiskMapZones(zones, riskScores);

  return (
    <>
      <PageHeader
        title="Risk Map"
        description="MapLibre risk layers with low-bandwidth table fallback for fire, wildlife, combined priority, and patrol planning views."
      />
      <RiskMap
        zones={mapZones}
        mapStyleUrl={process.env.MAP_STYLE_URL || "https://demotiles.maplibre.org/style.json"}
        hasRiskRun={Boolean(riskRun)}
      />
    </>
  );
}
