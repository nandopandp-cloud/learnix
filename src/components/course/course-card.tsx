"use client";

import Link from "next/link";
import Image from "next/image";
import { Play, Star, Lock, Clock } from "lucide-react";

import { cn, formatDuration } from "@/lib/utils";
import { Flashlight } from "@/components/ui/flashlight";
import type { CourseCard as CourseCardData } from "@/lib/queries";

/**
 * Card padrão do catálogo (fileiras "Populares", "Novos lançamentos"…).
 * Hover: eleva, revela o play e acende o flashlight.
 */
export function CourseCard({
  course,
  className,
}: {
  course: CourseCardData;
  className?: string;
}) {
  return (
    <Link
      href={`/cursos/${course.slug}`}
      className={cn("group block w-[15.5rem] shrink-0", className)}
    >
      <Flashlight className="border-gradient overflow-hidden rounded-xl bg-surface-1 transition-all duration-500 ease-[var(--ease-out-quint)] group-hover:-translate-y-1.5 group-hover:shadow-[0_20px_50px_-20px_rgba(0,0,0,0.9)]">
        <div className="relative aspect-video overflow-hidden bg-surface-2">
          {course.thumbnailUrl && (
            <Image
              src={course.thumbnailUrl}
              alt={course.title}
              fill
              sizes="248px"
              className="object-cover transition-transform duration-700 ease-[var(--ease-out-quint)] group-hover:scale-[1.07]"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />

          {/* Badges */}
          <div className="absolute top-2.5 left-2.5 flex gap-1.5">
            {course.isNew && (
              <span className="rounded bg-brand px-1.5 py-0.5 text-[0.6rem] font-bold tracking-wide text-white uppercase">
                Novo
              </span>
            )}
            {course.isPremium && (
              <span className="flex items-center gap-1 rounded bg-black/70 px-1.5 py-0.5 text-[0.6rem] font-semibold text-amber-300 backdrop-blur-sm">
                <Lock className="h-2.5 w-2.5" />
                Premium
              </span>
            )}
          </div>

          {/* Play no hover */}
          <span className="absolute top-1/2 left-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 scale-75 items-center justify-center rounded-full bg-brand opacity-0 shadow-lg transition-all duration-500 ease-[var(--ease-out-expo)] group-hover:scale-100 group-hover:opacity-100">
            <Play className="ml-0.5 h-5 w-5 fill-white text-white" />
          </span>

          {/* Barra de progresso, quando houver */}
          {course.progress !== undefined && course.progress > 0 && (
            <div className="absolute right-2.5 bottom-2.5 left-2.5">
              <div className="h-[3px] overflow-hidden rounded-full bg-white/25">
                <div
                  className="h-full rounded-full bg-brand transition-all duration-700"
                  style={{ width: `${course.progress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="p-3.5">
          <p className="truncate text-[0.6rem] font-medium tracking-[0.12em] text-neutral-500 uppercase">
            {course.categoryName}
          </p>
          <h3 className="mt-1.5 line-clamp-2 min-h-[2.5rem] text-[0.87rem] leading-snug font-medium text-white transition-colors group-hover:text-white">
            {course.title}
          </h3>
          <div className="mt-2.5 flex items-center justify-between text-[0.72rem] text-neutral-500">
            <span>{course.lessonCount} aulas</span>
            <span className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              {course.rating.toFixed(1).replace(".", ",")}
            </span>
          </div>
        </div>
      </Flashlight>
    </Link>
  );
}

/**
 * Card largo da fileira "Continue aprendendo": thumbnail maior,
 * progresso destacado e botão de play sempre visível.
 */
export function ContinueCard({ course }: { course: CourseCardData }) {
  return (
    <Link
      href={`/cursos/${course.slug}`}
      className="group block w-[19.5rem] shrink-0 sm:w-[21.5rem]"
    >
      <Flashlight className="border-gradient overflow-hidden rounded-xl bg-surface-1 transition-all duration-500 ease-[var(--ease-out-quint)] group-hover:-translate-y-1.5 group-hover:shadow-[0_24px_60px_-24px_rgba(0,0,0,0.95)]">
        <div className="relative aspect-video overflow-hidden bg-surface-2">
          {course.thumbnailUrl && (
            <Image
              src={course.thumbnailUrl}
              alt={course.title}
              fill
              sizes="344px"
              className="object-cover transition-transform duration-700 ease-[var(--ease-out-quint)] group-hover:scale-[1.06]"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent" />
        </div>

        <div className="relative p-4">
          <p className="text-[0.6rem] font-medium tracking-[0.14em] text-neutral-500 uppercase">
            {course.categoryName}
          </p>
          <h3 className="mt-1.5 line-clamp-2 min-h-[2.6rem] font-display text-[1.02rem] leading-snug font-semibold text-white">
            {course.title}
          </h3>

          <div className="mt-4 flex items-end justify-between gap-4">
            <div className="min-w-0 flex-1">
              <p className="mb-2 text-[0.72rem] text-neutral-400">
                {course.progress}% concluído
              </p>
              <div className="h-[3px] overflow-hidden rounded-full bg-white/15">
                <div
                  className="h-full rounded-full bg-brand transition-all duration-700 ease-[var(--ease-out-quint)]"
                  style={{ width: `${course.progress ?? 0}%` }}
                />
              </div>
            </div>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-black transition-all duration-300 group-hover:scale-110 group-hover:bg-brand group-hover:text-white">
              <Play className="ml-0.5 h-4 w-4 fill-current" />
            </span>
          </div>
        </div>
      </Flashlight>
    </Link>
  );
}

/** Card em grade, usado nas páginas de listagem. */
export function CourseGridCard({ course }: { course: CourseCardData }) {
  return (
    <Link href={`/cursos/${course.slug}`} className="group block">
      <Flashlight className="border-gradient h-full overflow-hidden rounded-xl bg-surface-1 transition-all duration-500 ease-[var(--ease-out-quint)] group-hover:-translate-y-1.5 group-hover:shadow-[0_20px_50px_-20px_rgba(0,0,0,0.9)]">
        <div className="relative aspect-video overflow-hidden bg-surface-2">
          {course.thumbnailUrl && (
            <Image
              src={course.thumbnailUrl}
              alt={course.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 45vw, 22vw"
              className="object-cover transition-transform duration-700 ease-[var(--ease-out-quint)] group-hover:scale-[1.07]"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />

          <div className="absolute top-2.5 left-2.5 flex gap-1.5">
            {course.isNew && (
              <span className="rounded bg-brand px-1.5 py-0.5 text-[0.6rem] font-bold tracking-wide text-white uppercase">
                Novo
              </span>
            )}
            {course.isPremium && (
              <span className="flex items-center gap-1 rounded bg-black/70 px-1.5 py-0.5 text-[0.6rem] font-semibold text-amber-300 backdrop-blur-sm">
                <Lock className="h-2.5 w-2.5" />
                Premium
              </span>
            )}
          </div>

          <span className="absolute top-1/2 left-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 scale-75 items-center justify-center rounded-full bg-brand opacity-0 shadow-lg transition-all duration-500 ease-[var(--ease-out-expo)] group-hover:scale-100 group-hover:opacity-100">
            <Play className="ml-0.5 h-5 w-5 fill-white text-white" />
          </span>

          {course.progress !== undefined && course.progress > 0 && (
            <div className="absolute right-2.5 bottom-2.5 left-2.5">
              <div className="h-[3px] overflow-hidden rounded-full bg-white/25">
                <div
                  className="h-full rounded-full bg-brand"
                  style={{ width: `${course.progress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="p-4">
          <p className="truncate text-[0.6rem] font-medium tracking-[0.12em] text-neutral-500 uppercase">
            {course.categoryName}
          </p>
          <h3 className="mt-1.5 line-clamp-2 min-h-[2.5rem] text-[0.9rem] leading-snug font-medium text-white">
            {course.title}
          </h3>
          {course.tagline && (
            <p className="mt-2 line-clamp-2 text-[0.75rem] leading-relaxed text-neutral-500">
              {course.tagline}
            </p>
          )}
          <div className="mt-3 flex items-center gap-3 text-[0.72rem] text-neutral-500">
            <span className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              {course.rating.toFixed(1).replace(".", ",")}
            </span>
            <span>·</span>
            <span>{course.lessonCount} aulas</span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDuration(course.totalDuration)}
            </span>
          </div>
        </div>
      </Flashlight>
    </Link>
  );
}
