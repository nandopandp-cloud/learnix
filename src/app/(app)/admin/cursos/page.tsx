import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { desc, eq, sql } from "drizzle-orm";
import { Plus, Pencil } from "lucide-react";

import { db } from "@/db";
import { courses, categories, instructors, lessons } from "@/db/schema";
import { formatDuration } from "@/lib/utils";
import { PageHeader } from "@/components/app/page-header";
import { Reveal } from "@/components/ui/reveal";
import { Button } from "@/components/ui/button";
import { DeleteCourseButton } from "./delete-button";

export const metadata: Metadata = { title: "Cursos · Admin" };

export default async function AdminCoursesPage() {
  const rows = await db
    .select({
      id: courses.id,
      title: courses.title,
      slug: courses.slug,
      thumbnailUrl: courses.thumbnailUrl,
      isPublished: courses.isPublished,
      isPremium: courses.isPremium,
      totalDuration: courses.totalDuration,
      categoryName: categories.name,
      instructorName: instructors.name,
      lessonCount: sql<number>`(
        select count(*)::int from ${lessons} where ${lessons.courseId} = ${courses.id}
      )`,
    })
    .from(courses)
    .leftJoin(categories, eq(courses.categoryId, categories.id))
    .leftJoin(instructors, eq(courses.instructorId, instructors.id))
    .orderBy(desc(courses.createdAt));

  return (
    <div>
      <PageHeader
        title="Cursos"
        description={`${rows.length} cursos cadastrados na plataforma.`}
        action={
          <Button asChild shimmer>
            <Link href="/admin/cursos/novo">
              <Plus className="h-4 w-4" />
              Novo curso
            </Link>
          </Button>
        }
      />

      <ul className="space-y-2.5 px-4 lg:px-8">
        {rows.map((course, i) => (
          <Reveal key={course.id} delay={Math.min(i * 0.03, 0.3)}>
            <li className="flex items-center gap-4 rounded-xl bg-surface-1 p-3 ring-1 ring-white/[0.07] transition hover:ring-white/15">
              <div className="relative aspect-video w-28 shrink-0 overflow-hidden rounded-lg bg-surface-2">
                {course.thumbnailUrl && (
                  <Image
                    src={course.thumbnailUrl}
                    alt=""
                    fill
                    sizes="112px"
                    className="object-cover"
                  />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="truncate text-[0.92rem] font-medium text-white">
                    {course.title}
                  </h2>
                  <span
                    className={
                      course.isPublished
                        ? "rounded-full bg-emerald-500/12 px-2 py-0.5 text-[0.62rem] text-emerald-400"
                        : "rounded-full bg-amber-500/12 px-2 py-0.5 text-[0.62rem] text-amber-400"
                    }
                  >
                    {course.isPublished ? "Publicado" : "Rascunho"}
                  </span>
                  {course.isPremium && (
                    <span className="rounded-full bg-brand/12 px-2 py-0.5 text-[0.62rem] text-brand">
                      Premium
                    </span>
                  )}
                </div>
                <p className="mt-1 truncate text-[0.78rem] text-neutral-500">
                  {course.categoryName ?? "Sem categoria"} ·{" "}
                  {course.instructorName ?? "Sem instrutor"} ·{" "}
                  {course.lessonCount} aulas ·{" "}
                  {formatDuration(course.totalDuration)}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link href={`/admin/cursos/${course.id}`}>
                    <Pencil className="h-3.5 w-3.5" />
                    Editar
                  </Link>
                </Button>
                <DeleteCourseButton
                  courseId={course.id}
                  title={course.title}
                />
              </div>
            </li>
          </Reveal>
        ))}
      </ul>
    </div>
  );
}
