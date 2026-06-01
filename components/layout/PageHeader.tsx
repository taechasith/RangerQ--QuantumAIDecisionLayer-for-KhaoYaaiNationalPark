export function PageHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mb-6">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-400 bg-emerald-950/40 border border-emerald-900/30 rounded-full px-3 py-1 inline-block">
        Phase 3
      </p>
      <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-white">{title}</h1>
      <p className="mt-2 max-w-3xl text-sm leading-relaxed text-zinc-400">{description}</p>
    </div>
  );
}

export function Card({
  title,
  value,
  detail,
}: {
  title: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="group rounded-xl border border-zinc-900 bg-zinc-900/20 backdrop-blur-md p-5 hover:border-emerald-500/30 hover:bg-zinc-900/40 transition-all duration-300">
      <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400 group-hover:text-zinc-300 transition-colors">{title}</p>
      <p className="mt-3 text-3xl font-black tracking-tight text-white bg-gradient-to-br from-white to-zinc-400 bg-clip-text">
        {value}
      </p>
      <p className="mt-2 text-xs text-zinc-500">{detail}</p>
    </div>
  );
}
