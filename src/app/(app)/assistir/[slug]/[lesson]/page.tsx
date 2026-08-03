import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { getCurrentUser } from "@/lib/auth";
import { getLessonView } from "@/lib/queries";
import { ensureEnrollment } from "@/app/(app)/actions";
import { WatchScreen } from "@/components/player/watch-screen";
import { WatchBreadcrumb } from "@/components/player/watch-breadcrumb";

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

  const {
    course,
    lesson,
    materials,
    position,
    completed,
    likeCount,
    liked,
    next,
    locked,
  } = view;

  // Aula bloqueada não conta como início de curso — não matricula.
  if (!locked) await ensureEnrollment(course.id);

  const nextHref = next ? `/assistir/${course.slug}/${next.slug}` : null;

  return (
    <>
      <WatchBreadcrumb
        courseTitle={course.title}
        courseSlug={course.slug}
        lessonTitle={lesson.title}
      />
      <WatchScreen
        course={course}
        lesson={lesson}
        materials={materials}
        position={position}
        completed={completed}
        likeCount={likeCount}
        liked={liked}
        nextHref={nextHref}
        locked={locked}
      />
    </>
  );
}
