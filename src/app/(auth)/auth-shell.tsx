import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { Reveal } from "@/components/ui/reveal";

const HIGHLIGHTS = [
  "Trilhas guiadas do básico ao avançado",
  "Continue de onde parou, em qualquer tela",
  "Certificado ao concluir cada curso",
];

/**
 * Moldura das telas de autenticação: painel editorial à esquerda,
 * formulário à direita. Fundo com grid + halo vermelho da marca.
 */
export function AuthShell({
  eyebrow,
  title,
  subtitle,
  children,
  footer,
}: {
  eyebrow: string;
  title: React.ReactNode;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-void lg:flex-row">
      {/* Halos de fundo */}
      <div className="pointer-events-none absolute inset-0 grid-pattern opacity-[0.35]" />
      <div className="pointer-events-none absolute -top-40 -left-40 h-[36rem] w-[36rem] rounded-full bg-brand/12 blur-[140px]" />
      <div className="pointer-events-none absolute -right-52 -bottom-52 h-[40rem] w-[40rem] rounded-full bg-brand-deep/10 blur-[160px]" />

      {/* Painel editorial */}
      <aside className="relative hidden w-[46%] flex-col justify-between border-r border-white/5 p-12 lg:flex xl:p-16">
        <Link href="/" className="w-fit">
          <Logo withTagline />
        </Link>

        <div className="max-w-md">
          <Reveal delay={0.1}>
            <p className="font-mono text-[0.65rem] tracking-[0.3em] text-neutral-500 uppercase">
              Learnix Platform
            </p>
          </Reveal>
          <Reveal delay={0.2}>
            <h2 className="mt-6 font-display text-5xl leading-[0.95] font-semibold tracking-tighter text-white xl:text-6xl">
              Todo o conhecimento
              <span className="mt-1 block text-neutral-500">
                em um só lugar.
              </span>
            </h2>
          </Reveal>
          <Reveal delay={0.3}>
            <ul className="mt-10 space-y-4">
              {HIGHLIGHTS.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-3 text-sm text-neutral-400"
                >
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        <Reveal delay={0.4}>
          <div className="flex items-center gap-3 font-mono text-[0.65rem] tracking-widest text-neutral-600 uppercase">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand" />
            Sistema online
          </div>
        </Reveal>
      </aside>

      {/* Formulário */}
      <main className="relative flex flex-1 items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-[26rem]">
          <Link href="/" className="mb-10 flex justify-center lg:hidden">
            <Logo />
          </Link>

          <Reveal delay={0.1}>
            <p className="font-mono text-[0.65rem] tracking-[0.3em] text-brand uppercase">
              {eyebrow}
            </p>
            <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight text-white">
              {title}
            </h1>
            <p className="mt-3 text-sm text-neutral-500">{subtitle}</p>
          </Reveal>

          <Reveal delay={0.25} className="mt-9">
            {children}
          </Reveal>

          {footer && (
            <Reveal delay={0.4} className="mt-8 text-center">
              {footer}
            </Reveal>
          )}
        </div>
      </main>
    </div>
  );
}
