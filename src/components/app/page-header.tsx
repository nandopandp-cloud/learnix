import { Reveal } from "@/components/ui/reveal";

/** Cabeçalho padrão das páginas internas. */
export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 px-4 pt-8 pb-6 lg:px-8">
      <div className="min-w-0">
        {eyebrow && (
          <Reveal>
            <p className="font-mono text-[0.66rem] tracking-[0.26em] text-brand uppercase">
              {eyebrow}
            </p>
          </Reveal>
        )}
        <Reveal delay={0.08}>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {title}
          </h1>
        </Reveal>
        {description && (
          <Reveal delay={0.16}>
            <p className="mt-2.5 max-w-xl text-[0.92rem] leading-relaxed text-neutral-500">
              {description}
            </p>
          </Reveal>
        )}
      </div>
      {action && <Reveal delay={0.2}>{action}</Reveal>}
    </div>
  );
}

/** Estado vazio reutilizado nas listagens. */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <Reveal className="mx-4 flex flex-col items-center rounded-2xl bg-surface-1 px-6 py-16 text-center ring-1 ring-white/[0.07] lg:mx-8">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-surface-2 ring-1 ring-white/10">
        <Icon className="h-6 w-6 text-neutral-500" />
      </span>
      <h3 className="mt-5 font-display text-lg font-semibold text-white">
        {title}
      </h3>
      <p className="mt-2 max-w-sm text-[0.88rem] leading-relaxed text-neutral-500">
        {description}
      </p>
      {action && <div className="mt-6">{action}</div>}
    </Reveal>
  );
}
