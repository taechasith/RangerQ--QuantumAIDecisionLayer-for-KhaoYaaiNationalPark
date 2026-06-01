export function PageHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mb-5 sm:mb-6">
      <p className="inline-flex rounded-full border border-emerald-900/40 bg-emerald-950/40 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-400">
        Operations
      </p>
      <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-white sm:mt-4 sm:text-3xl">{title}</h1>
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
    <div className="group rounded-xl border border-zinc-900/90 bg-zinc-900/35 p-4 shadow-lg shadow-black/10 backdrop-blur-md transition-all duration-300 hover:border-emerald-500/30 hover:bg-zinc-900/55 sm:p-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400 group-hover:text-zinc-300 transition-colors">{title}</p>
      <p className="mt-3 break-words text-2xl font-black tracking-tight text-white bg-gradient-to-br from-white to-zinc-400 bg-clip-text sm:text-3xl">
        {value}
      </p>
      <p className="mt-2 break-words text-xs text-zinc-500 [overflow-wrap:anywhere]">{detail}</p>
    </div>
  );
}
