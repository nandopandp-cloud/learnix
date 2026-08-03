import type { Metadata } from "next";
import { Check, Crown } from "lucide-react";

import { PageHeader } from "@/components/app/page-header";
import { Reveal } from "@/components/ui/reveal";
import { BeamButton } from "@/components/ui/button";
import { Flashlight } from "@/components/ui/flashlight";

export const metadata: Metadata = { title: "Premium" };

const PLANS = [
  {
    name: "Gratuito",
    price: "R$ 0",
    period: "para sempre",
    description: "Para conhecer a plataforma no seu ritmo.",
    features: [
      "Aulas gratuitas de todos os cursos",
      "Progresso salvo automaticamente",
      "Anotações nas aulas",
      "Acesso pelo navegador",
    ],
    cta: "Seu plano atual",
    highlight: false,
  },
  {
    name: "Premium",
    price: "R$ 39",
    period: "por mês",
    description: "Acesso completo, sem travas.",
    features: [
      "Catálogo completo liberado",
      "Certificados de conclusão",
      "Materiais de apoio para download",
      "Conteúdos exclusivos e lançamentos",
      "Sem anúncios",
      "Cancele quando quiser",
    ],
    cta: "Assinar agora",
    highlight: true,
  },
  {
    name: "Anual",
    price: "R$ 390",
    period: "por ano",
    description: "Dois meses grátis no plano completo.",
    features: [
      "Tudo do Premium",
      "Economia de 17%",
      "Prioridade no suporte",
      "Acesso antecipado a novidades",
    ],
    cta: "Assinar anual",
    highlight: false,
  },
];

export default function PremiumPage() {
  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[30rem] w-[50rem] -translate-x-1/2 rounded-full bg-brand/10 blur-[140px]" />

      <div className="relative">
        <PageHeader
          eyebrow="Learnix Premium"
          title="Desbloqueie tudo"
          description="Um único plano para todo o catálogo, certificados e conteúdos exclusivos."
        />

        <div className="grid gap-5 px-4 pb-12 lg:grid-cols-3 lg:px-8">
          {PLANS.map((plan, i) => (
            <Reveal key={plan.name} delay={i * 0.1}>
              {/* A badge fica fora do Flashlight: ele recorta o conteúdo
                  (overflow-hidden) e cortaria o selo, que é posicionado
                  para fora da borda superior do card. */}
              <div className="relative h-full">
                {plan.highlight && (
                  <span className="absolute -top-3 left-7 z-10 flex items-center gap-1.5 rounded-full bg-brand px-3 py-1 text-[0.66rem] font-bold tracking-wide text-white uppercase">
                    <Crown className="h-3 w-3" />
                    Mais popular
                  </span>
                )}
                <Flashlight
                  className={
                    plan.highlight
                      ? "border-gradient relative h-full rounded-2xl bg-surface-1 p-7 ring-1 ring-brand/30"
                      : "border-gradient h-full rounded-2xl bg-surface-1 p-7"
                  }
                >
                  {plan.highlight && (
                    <div className="pointer-events-none absolute -top-24 -right-24 h-56 w-56 rounded-full bg-brand/15 blur-3xl" />
                  )}

                  <h2 className="font-display text-lg font-semibold text-white">
                    {plan.name}
                  </h2>
                  <p className="mt-1.5 text-[0.82rem] text-neutral-500">
                    {plan.description}
                  </p>

                  <div className="mt-6 flex items-baseline gap-1.5">
                    <span className="font-display text-4xl font-bold tracking-tight text-white">
                      {plan.price}
                    </span>
                    <span className="text-[0.82rem] text-neutral-500">
                      {plan.period}
                    </span>
                  </div>

                  <ul className="mt-7 space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2.5">
                        <Check
                          className={
                            plan.highlight
                              ? "mt-0.5 h-4 w-4 shrink-0 text-brand"
                              : "mt-0.5 h-4 w-4 shrink-0 text-neutral-600"
                          }
                        />
                        <span className="text-[0.85rem] leading-relaxed text-neutral-300">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-8">
                    {plan.highlight ? (
                      <BeamButton className="w-full">{plan.cta}</BeamButton>
                    ) : (
                      <button
                        disabled={plan.name === "Gratuito"}
                        className="w-full rounded-lg bg-white/[0.08] px-5 py-3 text-sm font-medium text-white transition hover:bg-white/[0.14] disabled:pointer-events-none disabled:opacity-40"
                      >
                        {plan.cta}
                      </button>
                    )}
                  </div>
                </Flashlight>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
}
