import { Card, PageHeader } from "@/components/layout/PageHeader";
import { OptimizerResult } from "@/components/optimizer/OptimizerResult";
import { getOperationsSnapshot } from "@/lib/rangerqData";

export const dynamic = "force-dynamic";

export default async function OptimizerPage() {
  const { zones, riskRun, riskScores } = await getOperationsSnapshot();

  return (
    <>
      <PageHeader
        title="Optimization"
        description="Select daily patrol zones with deterministic greedy/local-search optimization and an inspectable QUBO payload."
      />
      <div className="grid gap-4 md:grid-cols-3">
        <Card title="Candidate zones" value={String(zones.length)} detail="Loaded from latest operations snapshot" />
        <Card title="Risk run" value={riskRun?.status || "Base fallback"} detail={riskRun?.completedAt || "Run risk scoring for latest scores"} />
        <Card title="Risk scores" value={String(riskScores.length)} detail="Used when available; base risk otherwise" />
      </div>
      <div className="mt-6">
        <OptimizerResult />
      </div>
    </>
  );
}
