"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  CheckCircle2,
  Lock,
  Circle,
  Download,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

import { cn } from "@/lib/utils";
import type { CourseDetail } from "@/lib/queries";

/**
 * Índice de módulos do curso — a coluna esquerda do mockup de overview.
 * O módulo com a próxima aula fica destacado em vermelho. Pode ser recolhida
 * para uma faixa de ícones, liberando espaço para o conteúdo do curso.
 */
export function ModuleSidebar({ course }: { course: CourseDetail }) {
  const [collapsed, setCollapsed] = useState(false);
  const nextLessonId = course.nextLesson?.id;

  return (
    <aside
      className={cn(
        "sticky top-[var(--topbar-h)] hidden h-[calc(100dvh-var(--topbar-h))] shrink-0 overflow-y-auto thin-scrollbar border-r border-white/[0.07] transition-[width] duration-300 ease-[var(--ease-out-quint)] xl:block",
        collapsed ? "w-[4.25rem]" : "w-[16.5rem]",
      )}
    >
      <div className={cn("py-5", collapsed ? "px-2" : "px-3")}>
        <div
          className={cn(
            "mb-5 flex items-center gap-1.5",
            collapsed ? "flex-col" : "justify-between px-2",
          )}
        >
          <Link
            href="/explorar"
            title={collapsed ? "Voltar à Explorar" : undefined}
            className={cn(
              "flex items-center gap-1.5 text-[0.82rem] text-neutral-400 transition hover:text-white",
              collapsed && "justify-center",
            )}
          >
            <ChevronLeft className="h-4 w-4 shrink-0" />
            {!collapsed && "Voltar à Explorar"}
          </Link>

          <button
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? "Expandir conteúdo do curso" : "Recolher conteúdo do curso"}
            title={collapsed ? "Expandir" : "Recolher"}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-neutral-500 transition hover:bg-white/[0.06] hover:text-white"
          >
            {collapsed ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </button>
        </div>

        {!collapsed && (
          <h2 className="mb-3 px-2 text-[0.9rem] font-semibold text-white">
            Conteúdo do curso
          </h2>
        )}

        <ul className="space-y-0.5">
          {course.modules.map((module, i) => {
            const total = module.lessons.length;
            const done = module.lessons.filter((l) => l.completed).length;
            const isComplete = total > 0 && done === total;
            const hasNext = module.lessons.some((l) => l.id === nextLessonId);
            // Módulo fica "bloqueado" visualmente enquanto não é o atual nem foi tocado.
            const locked = !hasNext && done === 0;
            const first = module.lessons[0];
            const href = first
              ? `/assistir/${course.slug}/${first.slug}`
              : `/cursos/${course.slug}`;

            if (collapsed) {
              return (
                <li key={module.id}>
                  <Link
                    href={href}
                    title={`${i + 1}. ${module.title}`}
                    className={cn(
                      "relative flex items-center justify-center rounded-lg py-2.5 transition-all duration-300",
                      hasNext ? "bg-brand/[0.12]" : "hover:bg-white/[0.05]",
                    )}
                  >
                    {hasNext && (
                      <span className="absolute top-1/2 left-0 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-brand" />
                    )}
                    {isComplete ? (
                      <CheckCircle2 className="h-4 w-4 fill-brand text-white" />
                    ) : hasNext ? (
                      <Circle className="h-4 w-4 text-brand" />
                    ) : locked ? (
                      <Lock className="h-3.5 w-3.5 text-neutral-700" />
                    ) : (
                      <Circle className="h-4 w-4 text-neutral-700" />
                    )}
                  </Link>
                </li>
              );
            }

            return (
              <li key={module.id}>
                <Link
                  href={href}
                  className={cn(
                    "relative flex items-start gap-2.5 rounded-lg px-2.5 py-2.5 transition-all duration-300",
                    hasNext
                      ? "bg-brand/[0.12]"
                      : "hover:bg-white/[0.05]",
                  )}
                >
                  {hasNext && (
                    <span className="absolute top-1/2 left-0 h-7 w-[3px] -translate-y-1/2 rounded-r-full bg-brand" />
                  )}

                  <span className="mt-0.5 shrink-0">
                    {isComplete ? (
                      <CheckCircle2 className="h-4 w-4 fill-brand text-white" />
                    ) : hasNext ? (
                      <Circle className="h-4 w-4 text-brand" />
                    ) : (
                      <Circle className="h-4 w-4 text-neutral-700" />
                    )}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span
                      className={cn(
                        "block text-[0.82rem] leading-snug",
                        hasNext
                          ? "font-medium text-brand"
                          : locked
                            ? "text-neutral-500"
                            : "text-neutral-300",
                      )}
                    >
                      {i + 1}. {module.title}
                    </span>
                    <span className="mt-0.5 block text-[0.7rem] text-neutral-600">
                      {total} {total === 1 ? "aula" : "aulas"}
                      {done > 0 && !isComplete && ` · ${done} concluída${done > 1 ? "s" : ""}`}
                    </span>
                  </span>

                  {locked && (
                    <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-neutral-700" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="mt-5 border-t border-white/[0.07] pt-4">
          <button
            title={collapsed ? "Baixar materiais" : undefined}
            className={cn(
              "flex w-full items-center gap-2 rounded-lg bg-surface-1 text-[0.8rem] text-neutral-300 ring-1 ring-white/10 transition hover:bg-surface-2 hover:text-white",
              collapsed ? "justify-center py-2.5" : "justify-center px-3 py-2.5",
            )}
          >
            <Download className="h-4 w-4 shrink-0" />
            {!collapsed && "Baixar materiais"}
          </button>
        </div>
      </div>
    </aside>
  );
}
