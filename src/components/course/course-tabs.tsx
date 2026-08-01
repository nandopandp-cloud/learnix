"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Play,
  FileText,
  Award,
  CheckCircle2,
  ChevronDown,
  Clock,
  Download,
  Star,
  MessageCircle,
} from "lucide-react";

import { cn, formatDuration, formatTimecode, formatCount } from "@/lib/utils";
import type { CourseDetail } from "@/lib/queries";

const TABS = [
  "Overview",
  "Conteúdo do curso",
  "Materiais",
  "Avaliações",
  "Perguntas",
] as const;

export function CourseTabs({ course }: { course: CourseDetail }) {
  const [active, setActive] = useState<(typeof TABS)[number]>("Overview");

  return (
    <div>
      {/* Navegação das abas */}
      <div className="hide-scrollbar mb-7 flex gap-1 overflow-x-auto border-b border-white/[0.07]">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActive(tab)}
            className={cn(
              "relative shrink-0 px-4 py-3 text-[0.88rem] transition-colors duration-300",
              active === tab
                ? "font-medium text-white"
                : "text-neutral-500 hover:text-neutral-300",
            )}
          >
            {tab}
            <span
              className={cn(
                "absolute right-3 -bottom-px left-3 h-[2px] rounded-full bg-brand transition-all duration-300 ease-[var(--ease-out-quint)]",
                active === tab ? "opacity-100" : "scale-x-0 opacity-0",
              )}
            />
          </button>
        ))}
      </div>

      <div key={active} style={{ animation: "animationIn 0.5s var(--ease-out-expo) both" }}>
        {active === "Overview" && <OverviewTab course={course} />}
        {active === "Conteúdo do curso" && <ContentTab course={course} />}
        {active === "Materiais" && <MaterialsTab course={course} />}
        {active === "Avaliações" && <ReviewsTab course={course} />}
        {active === "Perguntas" && <QuestionsTab />}
      </div>
    </div>
  );
}

/* -------------------------------- overview -------------------------------- */

function OverviewTab({ course }: { course: CourseDetail }) {
  return (
    <div className="space-y-10">
      <section>
        <h2 className="font-display text-[1.3rem] font-semibold tracking-tight text-white">
          Sobre este curso
        </h2>
        <p className="mt-4 max-w-2xl leading-relaxed whitespace-pre-line text-neutral-400">
          {course.description}
        </p>
      </section>

      {/* Métricas rápidas */}
      <section className="grid grid-cols-2 gap-x-6 gap-y-5 border-y border-white/[0.07] py-6 sm:grid-cols-4">
        <Metric
          icon={Play}
          value={String(course.lessonCount)}
          label="aulas"
          sub="Vídeos práticos"
        />
        <Metric
          icon={FileText}
          value={String(course.resourceCount)}
          label="recursos"
          sub="Materiais de apoio"
        />
        <Metric
          icon={Clock}
          value={formatDuration(course.totalDuration)}
          label=""
          sub="De conteúdo"
        />
        <Metric
          icon={Award}
          value="Certificado"
          label=""
          sub="Ao concluir"
        />
      </section>

      {course.learningPoints.length > 0 && (
        <section>
          <h2 className="font-display text-[1.3rem] font-semibold tracking-tight text-white">
            Você vai aprender
          </h2>
          <ul className="mt-5 grid gap-x-8 gap-y-3.5 sm:grid-cols-2">
            {course.learningPoints.map((point) => (
              <li key={point} className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-[1.1rem] w-[1.1rem] shrink-0 text-brand" />
                <span className="text-[0.9rem] leading-relaxed text-neutral-300">
                  {point}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function Metric({
  icon: Icon,
  value,
  label,
  sub,
}: {
  icon: React.ElementType;
  value: string;
  label: string;
  sub: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand/10 ring-1 ring-brand/20">
        <Icon className="h-[1.05rem] w-[1.05rem] text-brand" />
      </span>
      <div className="min-w-0">
        <p className="font-display text-[1.05rem] font-semibold whitespace-nowrap text-white">
          {value} {label}
        </p>
        <p className="text-[0.75rem] text-neutral-500">{sub}</p>
      </div>
    </div>
  );
}

/* -------------------------------- conteúdo -------------------------------- */

function ContentTab({ course }: { course: CourseDetail }) {
  const [openIds, setOpenIds] = useState<string[]>(
    course.modules[0] ? [course.modules[0].id] : [],
  );

  const toggle = (id: string) =>
    setOpenIds((ids) =>
      ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id],
    );

  return (
    <div className="space-y-2.5">
      <div className="mb-5 flex items-baseline justify-between">
        <p className="text-[0.85rem] text-neutral-400">
          {course.modules.length} módulos · {course.lessonCount} aulas ·{" "}
          {formatDuration(course.totalDuration)}
        </p>
        <button
          onClick={() =>
            setOpenIds((ids) =>
              ids.length === course.modules.length
                ? []
                : course.modules.map((m) => m.id),
            )
          }
          className="text-[0.8rem] text-brand transition hover:text-brand-bright"
        >
          {openIds.length === course.modules.length
            ? "Recolher todos"
            : "Expandir todos"}
        </button>
      </div>

      {course.modules.map((module, mi) => {
        const open = openIds.includes(module.id);
        const moduleDuration = module.lessons.reduce(
          (s, l) => s + l.duration,
          0,
        );
        const done = module.lessons.filter((l) => l.completed).length;

        return (
          <div
            key={module.id}
            className="overflow-hidden rounded-xl bg-surface-1 ring-1 ring-white/[0.07]"
          >
            <button
              onClick={() => toggle(module.id)}
              className="flex w-full items-center gap-3 px-4 py-4 text-left transition hover:bg-white/[0.03]"
            >
              <ChevronDown
                className={cn(
                  "h-4 w-4 shrink-0 text-neutral-500 transition-transform duration-300",
                  open && "rotate-180",
                )}
              />
              <span className="min-w-0 flex-1">
                <span className="block text-[0.92rem] font-medium text-white">
                  {mi + 1}. {module.title}
                </span>
                <span className="mt-0.5 block text-[0.75rem] text-neutral-500">
                  {module.lessons.length} aulas ·{" "}
                  {formatDuration(moduleDuration)}
                  {done > 0 && ` · ${done} concluída${done > 1 ? "s" : ""}`}
                </span>
              </span>
              {done === module.lessons.length && module.lessons.length > 0 && (
                <CheckCircle2 className="h-[1.1rem] w-[1.1rem] shrink-0 fill-brand text-white" />
              )}
            </button>

            {open && (
              <ul className="border-t border-white/[0.07]">
                {module.lessons.map((lesson) => (
                  <li key={lesson.id}>
                    <Link
                      href={`/assistir/${course.slug}/${lesson.slug}`}
                      className="group flex items-center gap-3 px-4 py-3 pl-11 transition hover:bg-white/[0.04]"
                    >
                      {lesson.completed ? (
                        <CheckCircle2 className="h-4 w-4 shrink-0 fill-brand text-white" />
                      ) : (
                        <Play className="h-3.5 w-3.5 shrink-0 text-neutral-600 transition group-hover:text-brand" />
                      )}
                      <span
                        className={cn(
                          "min-w-0 flex-1 truncate text-[0.85rem] transition",
                          lesson.completed
                            ? "text-neutral-500"
                            : "text-neutral-300 group-hover:text-white",
                        )}
                      >
                        {lesson.title}
                      </span>
                      {lesson.isFree && (
                        <span className="shrink-0 rounded bg-brand/15 px-1.5 py-0.5 text-[0.6rem] font-medium text-brand">
                          Grátis
                        </span>
                      )}
                      <span className="shrink-0 font-mono text-[0.72rem] text-neutral-600">
                        {formatTimecode(lesson.duration)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* -------------------------------- materiais ------------------------------- */

function MaterialsTab({ course }: { course: CourseDetail }) {
  if (course.materials.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="Nenhum material ainda"
        description="Os materiais de apoio deste curso serão publicados em breve."
      />
    );
  }

  return (
    <ul className="space-y-2.5">
      {course.materials.map((material) => (
        <li key={material.id}>
          <a
            href={material.fileUrl}
            className="group flex items-center gap-4 rounded-xl bg-surface-1 p-4 ring-1 ring-white/[0.07] transition-all duration-300 hover:bg-surface-2 hover:ring-white/15"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-brand/10 ring-1 ring-brand/20">
              <FileText className="h-5 w-5 text-brand" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[0.9rem] font-medium text-white">
                {material.title}
              </span>
              <span className="text-[0.75rem] text-neutral-500 uppercase">
                {material.fileType}
                {material.sizeLabel && ` · ${material.sizeLabel}`}
              </span>
            </span>
            <Download className="h-4 w-4 shrink-0 text-neutral-500 transition group-hover:text-white" />
          </a>
        </li>
      ))}
    </ul>
  );
}

/* ------------------------------- avaliações ------------------------------- */

function ReviewsTab({ course }: { course: CourseDetail }) {
  const distribution = [
    { stars: 5, pct: 78 },
    { stars: 4, pct: 16 },
    { stars: 3, pct: 4 },
    { stars: 2, pct: 1 },
    { stars: 1, pct: 1 },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-8 rounded-xl bg-surface-1 p-6 ring-1 ring-white/[0.07] sm:flex-row sm:items-center">
        <div className="text-center sm:w-40 sm:shrink-0">
          <p className="font-display text-5xl font-bold text-white">
            {course.rating.toFixed(1).replace(".", ",")}
          </p>
          <div className="mt-2 flex justify-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={cn(
                  "h-4 w-4",
                  i < Math.round(course.rating)
                    ? "fill-amber-400 text-amber-400"
                    : "text-neutral-700",
                )}
              />
            ))}
          </div>
          <p className="mt-2 text-[0.75rem] text-neutral-500">
            {formatCount(course.ratingCount)} avaliações
          </p>
        </div>

        <div className="flex-1 space-y-2">
          {distribution.map(({ stars, pct }) => (
            <div key={stars} className="flex items-center gap-3">
              <span className="w-10 shrink-0 text-right font-mono text-[0.72rem] text-neutral-500">
                {stars}★
              </span>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.08]">
                <div
                  className="h-full rounded-full bg-amber-400/80 transition-all duration-1000 ease-[var(--ease-out-quint)]"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="w-9 shrink-0 font-mono text-[0.72rem] text-neutral-500">
                {pct}%
              </span>
            </div>
          ))}
        </div>
      </div>

      <EmptyState
        icon={MessageCircle}
        title="Seja o primeiro a comentar"
        description="Conclua o curso para deixar sua avaliação e ajudar outros alunos."
      />
    </div>
  );
}

/* -------------------------------- perguntas ------------------------------- */

function QuestionsTab() {
  return (
    <EmptyState
      icon={MessageCircle}
      title="Nenhuma pergunta ainda"
      description="Tem alguma dúvida sobre o curso? Envie sua pergunta e o instrutor responderá em breve."
      action="Fazer uma pergunta"
    />
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  action?: string;
}) {
  return (
    <div className="flex flex-col items-center rounded-xl bg-surface-1 px-6 py-14 text-center ring-1 ring-white/[0.07]">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-2 ring-1 ring-white/10">
        <Icon className="h-5 w-5 text-neutral-500" />
      </span>
      <h3 className="mt-4 font-display text-[1.05rem] font-semibold text-white">
        {title}
      </h3>
      <p className="mt-2 max-w-sm text-[0.85rem] leading-relaxed text-neutral-500">
        {description}
      </p>
      {action && (
        <button className="mt-5 rounded-lg bg-white/10 px-4 py-2 text-[0.82rem] text-white transition hover:bg-white/15">
          {action}
        </button>
      )}
    </div>
  );
}
