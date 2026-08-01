"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { CheckCircle2, Play, Circle, Download } from "lucide-react";

import { cn, formatTimecode, formatDuration } from "@/lib/utils";
import type { CourseDetail } from "@/lib/queries";

/**
 * Playlist do curso à direita do player — espelha o mockup:
 * aula atual em vermelho, concluídas com check, demais neutras.
 */
export function Playlist({
  course,
  currentLessonId,
}: {
  course: CourseDetail;
  currentLessonId: string;
}) {
  const activeRef = useRef<HTMLAnchorElement>(null);

  /* Mantém a aula atual visível ao trocar de aula. */
  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [currentLessonId]);

  const flatLessons = course.modules.flatMap((m) => m.lessons);

  return (
    <div className="sticky top-[calc(var(--topbar-h)+1.5rem)] flex max-h-[calc(100dvh-var(--topbar-h)-3rem)] flex-col overflow-hidden rounded-xl bg-surface-1 ring-1 ring-white/[0.07]">
      {/* Cabeçalho */}
      <div className="shrink-0 border-b border-white/[0.07] p-4">
        <Link
          href={`/cursos/${course.slug}`}
          className="block font-display text-[1.02rem] leading-snug font-semibold text-white transition hover:text-brand"
        >
          {course.title}
        </Link>

        <div className="mt-2 flex items-center justify-between gap-3">
          <p className="text-[0.75rem] text-neutral-500">
            {course.lessonCount} aulas · {formatDuration(course.totalDuration)}
          </p>
          <p className="text-[0.75rem] whitespace-nowrap text-neutral-400">
            {course.progress}% concluído
          </p>
        </div>

        <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-brand transition-all duration-1000 ease-[var(--ease-out-quint)]"
            style={{ width: `${course.progress}%` }}
          />
        </div>
      </div>

      {/* Lista de aulas */}
      <ol className="thin-scrollbar min-h-0 flex-1 overflow-y-auto py-1.5">
        {flatLessons.map((lesson, i) => {
          const active = lesson.id === currentLessonId;

          return (
            <li key={lesson.id}>
              <Link
                ref={active ? activeRef : undefined}
                href={`/assistir/${course.slug}/${lesson.slug}`}
                className={cn(
                  "group relative flex items-center gap-3 px-4 py-3 transition-all duration-300",
                  active ? "bg-brand/[0.14]" : "hover:bg-white/[0.04]",
                )}
              >
                {active && (
                  <span className="absolute inset-y-1 left-0 w-[3px] rounded-r-full bg-brand" />
                )}

                <span className="shrink-0">
                  {active ? (
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand">
                      <Play className="ml-0.5 h-3 w-3 fill-white text-white" />
                    </span>
                  ) : lesson.completed ? (
                    <CheckCircle2 className="h-6 w-6 fill-brand text-white" />
                  ) : (
                    <Circle className="h-6 w-6 text-neutral-700 transition group-hover:text-neutral-500" />
                  )}
                </span>

                <span
                  className={cn(
                    "min-w-0 flex-1 truncate text-[0.83rem] transition-colors",
                    active
                      ? "font-medium text-white"
                      : lesson.completed
                        ? "text-neutral-500"
                        : "text-neutral-300 group-hover:text-white",
                  )}
                >
                  {i + 1}. {lesson.title}
                </span>

                <span
                  className={cn(
                    "shrink-0 font-mono text-[0.72rem] tabular-nums",
                    active ? "text-brand" : "text-neutral-600",
                  )}
                >
                  {formatTimecode(lesson.duration)}
                </span>
              </Link>
            </li>
          );
        })}
      </ol>

      {/* Rodapé */}
      <div className="shrink-0 border-t border-white/[0.07] p-3">
        <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-surface-2 px-3 py-2.5 text-[0.8rem] text-neutral-300 transition hover:bg-surface-3 hover:text-white">
          <Download className="h-4 w-4" />
          Baixar materiais do curso
        </button>
      </div>
    </div>
  );
}
