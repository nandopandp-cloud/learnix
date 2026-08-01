import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import {
  Play,
  Star,
  Clock,
  FileText,
  Award,
  BarChart3,
  Tag,
  Globe,
  Infinity as InfinityIcon,
  Calendar,
  ChevronLeft,
} from "lucide-react";

import { getCurrentUser } from "@/lib/auth";
import { getCourseBySlug } from "@/lib/queries";
import { formatDuration, formatCount } from "@/lib/utils";
import { Reveal } from "@/components/ui/reveal";
import { Button } from "@/components/ui/button";
import { WatchlistButton } from "@/components/course/watchlist-button";
import { CourseTabs } from "@/components/course/course-tabs";
import { ModuleSidebar } from "@/components/course/module-sidebar";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  return {
    title: course?.title ?? "Curso",
    description: course?.tagline ?? undefined,
  };
}

export default async function CoursePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const user = (await getCurrentUser())!;
  const course = await getCourseBySlug(slug, user.id);

  if (!course) notFound();

  const watchHref = course.nextLesson
    ? `/assistir/${course.slug}/${course.nextLesson.slug}`
    : `/cursos/${course.slug}`;

  return (
    <div className="flex">
      {/* Índice de módulos (desktop) */}
      <aside className="sticky top-[var(--topbar-h)] hidden h-[calc(100dvh-var(--topbar-h))] w-[16.5rem] shrink-0 overflow-y-auto thin-scrollbar border-r border-white/[0.07] xl:block">
        <ModuleSidebar course={course} />
      </aside>

      <div className="min-w-0 flex-1">
        {/* ------------------------------ hero ------------------------------ */}
        <section className="relative -mt-[var(--topbar-h)] overflow-hidden">
          <div className="absolute inset-0">
            {course.backdropUrl && (
              <Image
                src={course.backdropUrl}
                alt=""
                fill
                priority
                sizes="100vw"
                className="object-cover object-right"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-void via-void/95 to-void/30" />
            <div className="absolute inset-0 bg-gradient-to-t from-void via-transparent to-void/60" />
          </div>

          <div className="relative px-4 pt-[calc(var(--topbar-h)+2rem)] pb-10 lg:px-10">
            <Reveal>
              <Link
                href="/explorar"
                className="mb-6 inline-flex items-center gap-1.5 text-[0.8rem] text-neutral-400 transition hover:text-white xl:hidden"
              >
                <ChevronLeft className="h-4 w-4" />
                Voltar à Explorar
              </Link>
            </Reveal>

            <div className="max-w-2xl">
              <Reveal delay={0.05}>
                <p className="font-mono text-[0.68rem] font-medium tracking-[0.22em] text-brand uppercase">
                  {course.categoryName}
                </p>
              </Reveal>

              <Reveal delay={0.15}>
                <h1 className="mt-3 font-display text-4xl leading-[1.03] font-bold tracking-tight text-white sm:text-5xl lg:text-[3.4rem]">
                  {course.title}
                </h1>
              </Reveal>

              {course.tagline && (
                <Reveal delay={0.25}>
                  <p className="mt-4 max-w-lg text-[0.98rem] leading-relaxed text-neutral-300">
                    {course.tagline}
                  </p>
                </Reveal>
              )}

              <Reveal delay={0.32}>
                <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-[0.82rem] text-neutral-400">
                  <span className="flex items-center gap-1.5">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span className="font-medium text-white">
                      {course.rating.toFixed(1).replace(".", ",")}
                    </span>
                    <span>({formatCount(course.ratingCount)} avaliações)</span>
                  </span>
                  <span className="h-1 w-1 rounded-full bg-neutral-700" />
                  <span>{course.level}</span>
                  <span className="h-1 w-1 rounded-full bg-neutral-700" />
                  <span>{formatDuration(course.totalDuration)} de conteúdo</span>
                </div>
              </Reveal>

              <Reveal delay={0.42}>
                <div className="mt-7 flex flex-wrap items-center gap-3">
                  <Button asChild size="lg" shimmer>
                    <Link href={watchHref}>
                      <Play className="h-4 w-4 fill-current" />
                      {course.progress > 0
                        ? "Continuar assistindo"
                        : "Começar curso"}
                    </Link>
                  </Button>
                  <WatchlistButton
                    courseId={course.id}
                    initialSaved={course.inWatchlist}
                  />
                </div>
              </Reveal>

              {course.progress > 0 && (
                <Reveal delay={0.5}>
                  <div className="mt-8 max-w-lg">
                    <div className="mb-2 flex items-baseline justify-between text-[0.78rem]">
                      <span className="text-neutral-400">Seu progresso</span>
                      <span className="text-white">
                        {course.progress}% concluído
                      </span>
                    </div>
                    <div className="h-1 overflow-hidden rounded-full bg-white/12">
                      <div
                        className="h-full rounded-full bg-brand transition-all duration-1000 ease-[var(--ease-out-quint)]"
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                    <p className="mt-2 text-[0.72rem] text-neutral-500">
                      {course.completedCount} de {course.lessonCount} aulas
                      concluídas
                    </p>
                  </div>
                </Reveal>
              )}
            </div>
          </div>
        </section>

        {/* ------------------------- conteúdo + aside ------------------------ */}
        <div className="grid gap-8 px-4 py-8 lg:px-10 xl:grid-cols-[1fr_20rem]">
          <div className="min-w-0">
            <CourseTabs course={course} />
          </div>

          <aside className="space-y-5">
            <Reveal delay={0.2}>
              <InstructorPanel course={course} />
            </Reveal>
            <Reveal delay={0.3}>
              <CourseInfoPanel course={course} />
            </Reveal>
          </aside>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------- painéis --------------------------------- */

type Course = NonNullable<Awaited<ReturnType<typeof getCourseBySlug>>>;

function InstructorPanel({ course }: { course: Course }) {
  return (
    <div className="border-gradient rounded-xl bg-surface-1 p-5">
      <h3 className="font-display text-[1.05rem] font-semibold text-white">
        Instrutor
      </h3>

      <div className="mt-4 flex items-start gap-3.5">
        <span className="relative block h-14 w-14 shrink-0 overflow-hidden rounded-full bg-surface-2 ring-1 ring-white/10">
          {course.instructorAvatar && (
            <Image
              src={course.instructorAvatar}
              alt={course.instructorName ?? ""}
              fill
              sizes="56px"
              className="object-cover"
            />
          )}
        </span>
        <div className="min-w-0">
          <p className="font-medium text-white">{course.instructorName}</p>
          <p className="text-[0.78rem] text-neutral-400">
            {course.instructorTitle}
          </p>
        </div>
      </div>

      {course.instructorBio && (
        <p className="mt-4 text-[0.8rem] leading-relaxed text-neutral-400">
          {course.instructorBio}
        </p>
      )}

      <Button variant="outline" size="sm" className="mt-5 w-full">
        Ver perfil do instrutor
      </Button>
    </div>
  );
}

function CourseInfoPanel({ course }: { course: Course }) {
  const rows = [
    { icon: BarChart3, label: "Nível", value: course.level },
    { icon: Tag, label: "Categoria", value: course.categoryName ?? "—" },
    { icon: Globe, label: "Idioma", value: course.language },
    { icon: InfinityIcon, label: "Acesso", value: "Vitalício" },
    ...(course.updatedLabel
      ? [{ icon: Calendar, label: "Atualizado em", value: course.updatedLabel }]
      : []),
  ];

  return (
    <div className="border-gradient rounded-xl bg-surface-1 p-5">
      <h3 className="font-display text-[1.05rem] font-semibold text-white">
        Informações do curso
      </h3>

      <dl className="mt-4 space-y-3.5">
        {rows.map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-center justify-between gap-3">
            <dt className="flex items-center gap-2.5 text-[0.82rem] text-neutral-400">
              <Icon className="h-4 w-4 text-brand" />
              {label}
            </dt>
            <dd className="truncate text-[0.82rem] text-neutral-200">
              {value}
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-5 border-t border-white/[0.07] pt-5">
        <div className="grid grid-cols-2 gap-3 text-center">
          <Stat icon={Play} value={String(course.lessonCount)} label="aulas" />
          <Stat
            icon={Clock}
            value={formatDuration(course.totalDuration)}
            label="conteúdo"
          />
          <Stat
            icon={FileText}
            value={String(course.resourceCount)}
            label="materiais"
          />
          <Stat
            icon={Award}
            value={course.hasCertificate ? "Sim" : "Não"}
            label="certificado"
          />
        </div>
      </div>
    </div>
  );
}

function Stat({
  icon: Icon,
  value,
  label,
}: {
  icon: React.ElementType;
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-lg bg-surface-2/60 p-3">
      <Icon className="mx-auto h-4 w-4 text-neutral-500" />
      <p className="mt-1.5 text-[0.9rem] font-semibold text-white">{value}</p>
      <p className="text-[0.68rem] text-neutral-500">{label}</p>
    </div>
  );
}
