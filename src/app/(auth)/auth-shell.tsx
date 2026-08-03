import Link from "next/link";
import { PlayCircle, Clock, BookmarkCheck } from "lucide-react";

import { Logo } from "@/components/brand/logo";
import { Reveal } from "@/components/ui/reveal";
import { CourseMosaic } from "./course-mosaic";

const HIGHLIGHTS = [
  {
    icon: PlayCircle,
    title: "Conteúdo de qualidade",
    description: "Aprenda com especialistas e profissionais do mercado.",
  },
  {
    icon: Clock,
    title: "Aprenda no seu ritmo",
    description: "Acesse de qualquer dispositivo, quando quiser.",
  },
  {
    icon: BookmarkCheck,
    title: "Certificados",
    description: "Conclua cursos e receba seu certificado.",
  },
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

      {/* Mosaico de cursos: vive no container raiz para atravessar por baixo
          do formulário, em vez de ser recortado na borda do painel. */}
      <CourseMosaic />

      {/* Painel editorial */}
      <aside className="relative hidden w-[54%] flex-col justify-between p-12 lg:flex xl:p-16">
        {/* Conteúdo acima do mosaico */}
        <div className="relative z-10">
          <Link href="/" className="w-fit">
            <Logo />
          </Link>
        </div>

        <div className="relative z-10 max-w-lg">
          <Reveal delay={0.15}>
            <h2 className="font-display text-[3.4rem] leading-[0.98] font-bold tracking-tighter text-white xl:text-[4rem]">
              Aprenda.
              <span className="mt-1 block">Evolua.</span>
              <span className="mt-1 block text-brand">Alcance mais.</span>
            </h2>
          </Reveal>

          <Reveal delay={0.25}>
            <p className="mt-6 max-w-sm text-[0.95rem] leading-relaxed text-neutral-400">
              Milhares de cursos em vídeo para você aprender quando e onde
              quiser.
            </p>
          </Reveal>

          <Reveal delay={0.35}>
            <ul className="mt-10 space-y-6">
              {HIGHLIGHTS.map(({ icon: Icon, title, description }) => (
                <li key={title} className="flex items-start gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand/10 ring-1 ring-brand/25">
                    <Icon className="h-5 w-5 text-brand" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[0.92rem] font-semibold text-white">
                      {title}
                    </span>
                    <span className="mt-1 block max-w-[17rem] text-[0.85rem] leading-relaxed text-neutral-500">
                      {description}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        <Reveal delay={0.45}>
          <div className="relative z-10 flex items-center gap-3 font-mono text-[0.65rem] tracking-widest text-neutral-600 uppercase">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand" />
            Sistema online
          </div>
        </Reveal>
      </aside>

      {/* Formulário — z-10 para ficar acima do mosaico, que atravessa o fundo */}
      <main className="relative z-10 flex flex-1 items-center justify-center p-6 sm:p-10">
        {/* Véu no desktop: o mosaico passa por baixo e não pode competir com
            os campos. A faixa da esquerda dissolve a emenda; o restante é
            sólido para garantir contraste em qualquer largura. */}
        <div className="pointer-events-none absolute inset-y-0 -left-56 hidden w-56 bg-gradient-to-r from-transparent via-void/70 to-void lg:block" />
        <div className="pointer-events-none absolute inset-0 hidden bg-void lg:block" />

        <div className="relative w-full max-w-[26rem]">
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
