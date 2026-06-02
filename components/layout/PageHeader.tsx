export function PageHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mb-5 sm:mb-6">
      <p className="telemetry-label inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[10px] font-bold text-emerald-300">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
        Operations
      </p>
      <h1 className="mt-3 text-2xl font-black tracking-tight text-white sm:mt-4 sm:text-3xl">{title}</h1>
      <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-400">{description}</p>
    </div>
  );
}

export function Card({
  title,
  value,
  detail,
  tone = "emerald",
}: {
  title: string;
  value: string;
  detail: string;
  tone?: "emerald" | "amber" | "rose" | "cyan";
}) {
  const tones = {
    emerald: "border-emerald-500/15 text-emerald-300 bg-emerald-500/10",
    amber: "border-amber-500/15 text-amber-300 bg-amber-500/10",
    rose: "border-rose-500/15 text-rose-300 bg-rose-500/10",
    cyan: "border-cyan-500/15 text-cyan-300 bg-cyan-500/10",
  };

  return (
    <div className="console-panel group rounded-xl p-4 transition-all duration-300 hover:border-emerald-500/25 sm:p-5">
      <div className="relative flex items-center justify-between gap-3">
        <p className="telemetry-label text-[10px] font-bold text-slate-400 group-hover:text-slate-300 transition-colors">{title}</p>
        <span className={`h-2 w-2 rounded-full border ${tones[tone]}`} />
      </div>
      <p className="relative mt-3 break-words font-mono text-2xl font-black tracking-tight text-white sm:text-3xl">
        {value}
      </p>
      <p className="relative mt-2 break-words text-[11px] leading-relaxed text-slate-500 [overflow-wrap:anywhere]">{detail}</p>
    </div>
  );
}
