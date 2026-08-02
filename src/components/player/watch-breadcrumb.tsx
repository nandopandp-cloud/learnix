import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

/**
 * Trilha de navegação no topo da tela de assistir: Início → Curso → Aula
 * atual, para o aluno voltar rapidamente sem depender só da playlist lateral.
 */
export function WatchBreadcrumb({
  courseTitle,
  courseSlug,
  lessonTitle,
}: {
  courseTitle: string;
  courseSlug: string;
  lessonTitle: string;
}) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="hide-scrollbar flex items-center gap-1.5 overflow-x-auto px-4 pt-4 text-[0.8rem] whitespace-nowrap lg:px-6"
    >
      <Link
        href="/inicio"
        className="flex items-center gap-1.5 text-neutral-500 transition hover:text-white"
      >
        <Home className="h-3.5 w-3.5" />
        Início
      </Link>
      <ChevronRight className="h-3.5 w-3.5 shrink-0 text-neutral-700" />
      <Link
        href={`/cursos/${courseSlug}`}
        className="max-w-[16rem] truncate text-neutral-500 transition hover:text-white"
      >
        {courseTitle}
      </Link>
      <ChevronRight className="h-3.5 w-3.5 shrink-0 text-neutral-700" />
      <span className="max-w-[20rem] truncate font-medium text-white">
        {lessonTitle}
      </span>
    </nav>
  );
}
