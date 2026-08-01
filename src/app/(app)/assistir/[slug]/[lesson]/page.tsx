import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { getCurrentUser } from "@/lib/auth";
import { getLessonView } from "@/lib/queries";
import { ensureEnrollment } from "@/app/(app)/actions";
import { VideoPlayer } from "@/components/player/video-player";
import { LessonPanel } from "@/components/player/lesson-panel";
import { Playlist } from "@/components/player/playlist";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; lesson: string }>;
}): Promise<Metadata> {
  const { slug, lesson } = await params;
  const user = await getCurrentUser();
  if (!user) return { title: "Aula" };

  const view = await getLessonView(slug, lesson, user.id);
  return { title: view ? `${view.lesson.title} — ${view.course.title}` : "Aula" };
}

export default async function WatchPage({
  params,
}: {
  params: Promise<{ slug: string; lesson: string }>;
}) {
  const { slug, lesson: lessonSlug } = await params;
  const user = (await getCurrentUser())!;

  const view = await getLessonView(slug, lessonSlug, user.id);
  if (!view) notFound();

  const { course, lesson, materials, position, completed, next } = view;

  // Abrir a aula matricula o aluno e atualiza o "último acesso".
  await ensureEnrollment(course.id);

  const nextHref = next ? `/assistir/${course.slug}/${next.slug}` : null;

  return (
    <div className="grid gap-6 px-4 py-6 lg:px-6 xl:grid-cols-[1fr_23rem]">
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
        <Playlist course={course} currentLessonId={lesson.id} />
      </aside>
    </div>
  );
}
