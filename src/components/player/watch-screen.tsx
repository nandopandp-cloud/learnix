"use client";

import { useState } from "react";
import Link from "next/link";
import { Lock } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { VideoPlayer } from "@/components/player/video-player";
import { LessonPanel } from "@/components/player/lesson-panel";
import { Playlist } from "@/components/player/playlist";
import type { CourseDetail } from "@/lib/queries";

type LessonWithProgress = CourseDetail["lessons"][number];
type Material = CourseDetail["materials"][number];

/**
 * Tela de assistir completa: grid vídeo/playlist com a playlist recolhível.
 * Fica em um único Client Component para evitar passar render props
 * (funções) como children de um Server Component para um Client Component,
 * o que o React não serializa através desse boundary.
 */
export function WatchScreen({
  course,
  lesson,
  materials,
  position,
  completed,
  likeCount,
  liked,
  nextHref,
  locked = false,
}: {
  course: CourseDetail;
  lesson: LessonWithProgress;
  materials: Material[];
  position: number;
  completed: boolean;
  likeCount: number;
  liked: boolean;
  nextHref: string | null;
  locked?: boolean;
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      className={cn(
        "grid gap-6 px-4 py-6 transition-[grid-template-columns] duration-300 ease-[var(--ease-out-quint)] lg:px-6",
        collapsed ? "xl:grid-cols-[1fr_4.5rem]" : "xl:grid-cols-[1fr_23rem]",
      )}
    >
      <div className="min-w-0">
        {locked ? (
          <PremiumLock poster={lesson.thumbnailUrl ?? course.thumbnailUrl} />
        ) : (
          <VideoPlayer
            src={lesson.videoUrl ?? ""}
            poster={lesson.thumbnailUrl ?? course.thumbnailUrl}
            lessonId={lesson.id}
            courseId={course.id}
            initialPosition={position}
            initiallyCompleted={completed}
            nextHref={nextHref}
            title={lesson.title}
          />
        )}

        <LessonPanel
          course={course}
          lesson={lesson}
          materials={materials}
          completed={completed}
          likeCount={likeCount}
          liked={liked}
        />
      </div>

      <aside className="min-w-0">
        <Playlist
          course={course}
          currentLessonId={lesson.id}
          collapsed={collapsed}
          onToggle={() => setCollapsed(!collapsed)}
        />
      </aside>
    </div>
  );
}

/** Ocupa o lugar do player quando a aula é paga e o aluno não é assinante. */
function PremiumLock({ poster }: { poster: string | null }) {
  return (
    <div className="relative aspect-video overflow-hidden rounded-xl bg-surface-1 ring-1 ring-white/[0.07]">
      {poster && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={poster}
          alt=""
          className="absolute inset-0 h-full w-full scale-105 object-cover opacity-20 blur-xl"
        />
      )}
      <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand/15 ring-1 ring-brand/25">
          <Lock className="h-5 w-5 text-brand" />
        </span>
        <h2 className="mt-4 font-display text-[1.15rem] font-semibold text-white">
          Aula exclusiva para assinantes
        </h2>
        <p className="mt-2 max-w-sm text-[0.85rem] leading-relaxed text-neutral-400">
          Assine o Premium para assistir a esta aula e baixar os materiais de
          apoio do curso.
        </p>
        <Button asChild size="sm" shimmer className="mt-5">
          <Link href="/premium">Assine agora</Link>
        </Button>
      </div>
    </div>
  );
}
