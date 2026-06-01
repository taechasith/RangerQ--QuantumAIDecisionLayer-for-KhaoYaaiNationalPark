export function PageHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mb-6">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">Phase 3</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-950">{title}</h1>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-600">{description}</p>
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
    <div className="rounded-lg border border-zinc-200 bg-white p-5">
      <p className="text-sm font-medium text-zinc-500">{title}</p>
      <p className="mt-2 text-2xl font-semibold text-zinc-950">{value}</p>
      <p className="mt-2 text-sm leading-6 text-zinc-600">{detail}</p>
    </div>
  );
}
