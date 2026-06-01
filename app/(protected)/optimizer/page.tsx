import { Card, PageHeader } from "@/components/layout/PageHeader";
import { OptimizerResult } from "@/components/optimizer/OptimizerResult";
import { getOperationsSnapshot } from "@/lib/rangerqData";

export const dynamic = "force-dynamic";

export default async function OptimizerPage() {
  const { zones, riskRun, riskScores } = await getOperationsSnapshot();

  return (
    <>
      <PageHeader
        title="Smart Patrol Planner"
        description="Choose which zones to patrol today based on threat levels, terrain difficulty, and ranger team availability."
      />
      <div className="grid gap-4 md:grid-cols-3">
        <Card title="Zones Available" value={String(zones.length)} detail="Loaded from Khao Yai map regions" />
        <Card title="Latest Threat Update" value={riskRun?.status || "Base baseline active"} detail={riskRun?.completedAt ? new Date(riskRun.completedAt).toLocaleDateString() : "Update danger levels for latest intelligence"} />
        <Card title="Active Scores" value={String(riskScores.length)} detail="Calculated danger ratings in use" />
      </div>
      <div className="mt-6">
        <OptimizerResult />
      </div>
    </>
  );
}
