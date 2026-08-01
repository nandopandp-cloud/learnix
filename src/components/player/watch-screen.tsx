"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
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
  nextHref,
}: {
  course: CourseDetail;
  lesson: LessonWithProgress;
  materials: Material[];
  position: number;
  completed: boolean;
  nextHref: string | null;
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

        <LessonPanel
          course={course}
          lesson={lesson}
          materials={materials}
          completed={completed}
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
