import type { Metadata } from "next";
import { LifeBuoy, Mail, MessageCircle, BookOpen } from "lucide-react";

import { PageHeader } from "@/components/app/page-header";
import { Reveal } from "@/components/ui/reveal";
import { Flashlight } from "@/components/ui/flashlight";

export const metadata: Metadata = { title: "Ajuda" };

const FAQ = [
  {
    q: "Como funciona o acesso aos cursos?",
    a: "Ao criar sua conta você já pode assistir às aulas gratuitas de cada curso. Com o plano Premium, todo o catálogo fica liberado, sem limite de tempo.",
  },
  {
    q: "Meu progresso fica salvo?",
    a: "Sim. A Learnix salva automaticamente onde você parou em cada aula, então é só voltar e continuar de onde estava — em qualquer dispositivo.",
  },
  {
    q: "Como recebo meu certificado?",
    a: "Ao concluir 100% das aulas de um curso, o certificado é liberado automaticamente na página Certificados, pronto para download.",
  },
  {
    q: "Posso assistir offline?",
    a: "O download de aulas para assistir offline está em desenvolvimento. Os materiais de apoio em PDF já podem ser baixados dentro de cada curso.",
  },
  {
    q: "Como cancelo minha assinatura?",
    a: "Você pode cancelar quando quiser em Configurações. O acesso Premium permanece ativo até o fim do período já pago.",
  },
];

const CHANNELS = [
  {
    icon: Mail,
    title: "E-mail",
    description: "Respondemos em até 24 horas úteis.",
    value: "suporte@learnix.com",
  },
  {
    icon: MessageCircle,
    title: "Chat ao vivo",
    description: "Segunda a sexta, das 9h às 18h.",
    value: "Iniciar conversa",
  },
  {
    icon: BookOpen,
    title: "Central de ajuda",
    description: "Artigos e tutoriais passo a passo.",
    value: "Acessar artigos",
  },
];

export default function AjudaPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Suporte"
        title="Como podemos ajudar?"
        description="Tire suas dúvidas ou fale com nosso time."
      />

      <div className="grid gap-4 px-4 pb-10 lg:grid-cols-3 lg:px-8">
        {CHANNELS.map((channel, i) => (
          <Reveal key={channel.title} delay={i * 0.07}>
            <Flashlight className="border-gradient h-full rounded-2xl bg-surface-1 p-5 transition-all duration-500 hover:-translate-y-1 hover:bg-surface-2">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand/10 ring-1 ring-brand/20">
                <channel.icon className="h-5 w-5 text-brand" />
              </span>
              <h2 className="mt-4 font-display text-[1.05rem] font-semibold text-white">
                {channel.title}
              </h2>
              <p className="mt-1.5 text-[0.82rem] text-neutral-500">
                {channel.description}
              </p>
              <p className="mt-3 text-[0.85rem] font-medium text-neutral-200">
                {channel.value}
              </p>
            </Flashlight>
          </Reveal>
        ))}
      </div>

      <section className="max-w-3xl px-4 lg:px-8">
        <Reveal>
          <h2 className="flex items-center gap-2.5 font-display text-xl font-semibold tracking-tight text-white">
            <LifeBuoy className="h-5 w-5 text-brand" />
            Perguntas frequentes
          </h2>
        </Reveal>

        <div className="mt-5 space-y-2.5">
          {FAQ.map((item, i) => (
            <Reveal key={item.q} delay={i * 0.05}>
              <details className="group overflow-hidden rounded-xl bg-surface-1 ring-1 ring-white/[0.07] transition hover:ring-white/15">
                <summary className="flex cursor-pointer items-center justify-between gap-4 px-5 py-4 text-[0.9rem] font-medium text-white marker:content-['']">
                  {item.q}
                  <span className="shrink-0 text-neutral-500 transition-transform duration-300 group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="border-t border-white/[0.07] px-5 py-4 text-[0.86rem] leading-relaxed text-neutral-400">
                  {item.a}
                </p>
              </details>
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  );
}
