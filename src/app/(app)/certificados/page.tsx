import type { Metadata } from "next";
import Link from "next/link";
import { Award, Download, CheckCircle2 } from "lucide-react";

import { getCurrentUser } from "@/lib/auth";
import { getCertificates, getUserStats } from "@/lib/queries";
import { formatDuration } from "@/lib/utils";
import { PageHeader, EmptyState } from "@/components/app/page-header";
import { Reveal } from "@/components/ui/reveal";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/logo";

export const metadata: Metadata = { title: "Certificados" };

export default async function CertificadosPage() {
  const user = (await getCurrentUser())!;
  const [certificates, stats] = await Promise.all([
    getCertificates(user.id),
    getUserStats(user.id),
  ]);

  return (
    <div>
      <PageHeader
        eyebrow="Conquistas"
        title="Certificados"
        description="Cursos concluídos e prontos para entrar no seu currículo."
      />

      {/* Resumo */}
      <div className="grid grid-cols-2 gap-4 px-4 pb-8 lg:grid-cols-4 lg:px-8">
        <StatCard
          label="Certificados"
          value={String(stats.certificates)}
          delay={0}
        />
        <StatCard
          label="Aulas assistidas"
          value={String(stats.lessonsWatched)}
          delay={0.06}
        />
        <StatCard
          label="Cursos iniciados"
          value={String(stats.coursesStarted)}
          delay={0.12}
        />
        <StatCard
          label="Tempo de estudo"
          value={formatDuration(stats.secondsWatched)}
          delay={0.18}
        />
      </div>

      {certificates.length === 0 ? (
        <EmptyState
          icon={Award}
          title="Nenhum certificado ainda"
          description="Conclua 100% das aulas de um curso para desbloquear seu certificado."
          action={
            <Button asChild shimmer>
              <Link href="/cursos">Ver meus cursos</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 px-4 lg:grid-cols-2 lg:px-8">
          {certificates.map((cert, i) => (
            <Reveal key={cert.courseId} delay={i * 0.08}>
              <article className="border-gradient relative overflow-hidden rounded-2xl bg-surface-1 p-6">
                <div className="pointer-events-none absolute -top-20 -right-20 h-48 w-48 rounded-full bg-brand/12 blur-3xl" />

                <div className="flex items-start justify-between gap-4">
                  <Logo />
                  <span className="flex items-center gap-1.5 rounded-full bg-brand/12 px-2.5 py-1 text-[0.68rem] font-medium text-brand ring-1 ring-brand/25">
                    <CheckCircle2 className="h-3 w-3" />
                    Concluído
                  </span>
                </div>

                <p className="mt-8 font-mono text-[0.66rem] tracking-[0.24em] text-neutral-500 uppercase">
                  Certificado de conclusão
                </p>
                <h2 className="mt-2 font-display text-xl leading-snug font-semibold text-white">
                  {cert.title}
                </h2>
                <p className="mt-2 text-[0.82rem] text-neutral-500">
                  {cert.instructorName} · {cert.total} aulas ·{" "}
                  {formatDuration(cert.totalDuration)}
                </p>

                <div className="mt-6 flex items-center justify-between gap-4 border-t border-white/[0.07] pt-5">
                  <div>
                    <p className="text-[0.68rem] text-neutral-600">
                      Emitido para
                    </p>
                    <p className="text-[0.88rem] font-medium text-white">
                      {user.name}
                    </p>
                  </div>
                  <Button size="sm" variant="outline">
                    <Download className="h-3.5 w-3.5" />
                    Baixar PDF
                  </Button>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  delay,
}: {
  label: string;
  value: string;
  delay: number;
}) {
  return (
    <Reveal delay={delay}>
      <div className="rounded-xl bg-surface-1 p-5 ring-1 ring-white/[0.07]">
        <p className="font-display text-2xl font-bold text-white">{value}</p>
        <p className="mt-1 text-[0.78rem] text-neutral-500">{label}</p>
      </div>
    </Reveal>
  );
}
