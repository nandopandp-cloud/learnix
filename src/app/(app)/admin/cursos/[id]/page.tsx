import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { ChevronLeft, ExternalLink } from "lucide-react";

import { db } from "@/db";
import {
  categories,
  courses,
  instructors,
  lessons,
  materials,
  modules,
} from "@/db/schema";
import { PageHeader } from "@/components/app/page-header";
import { CourseForm } from "../course-form";
import { CurriculumEditor } from "./curriculum-editor";
import { MaterialsEditor } from "./materials-editor";

export const metadata: Metadata = { title: "Editar curso · Admin" };

export default async function EditCoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [course] = await db
    .select()
    .from(courses)
    .where(eq(courses.id, id))
    .limit(1);

  if (!course) notFound();

  const [cats, insts, moduleRows, lessonRows, materialRows] = await Promise.all([
    db.select().from(categories).orderBy(categories.sortOrder),
    db.select().from(instructors).orderBy(instructors.name),
    db.select().from(modules).where(eq(modules.courseId, id)).orderBy(modules.sortOrder),
    db.select().from(lessons).where(eq(lessons.courseId, id)).orderBy(lessons.sortOrder),
    db
      .select()
      .from(materials)
      .where(eq(materials.courseId, id))
      .orderBy(materials.sortOrder),
  ]);

  return (
    <div>
      <div className="flex items-center justify-between gap-4 px-4 pt-6 lg:px-8">
        <Link
          href="/admin/cursos"
          className="inline-flex items-center gap-1.5 text-[0.82rem] text-neutral-400 transition hover:text-white"
        >
          <ChevronLeft className="h-4 w-4" />
          Voltar aos cursos
        </Link>
        <Link
          href={`/cursos/${course.slug}`}
          className="inline-flex items-center gap-1.5 text-[0.82rem] text-brand transition hover:text-brand-bright"
        >
          Ver na plataforma
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </div>

      <PageHeader
        title={course.title}
        description="Edite os dados, módulos, aulas e materiais do curso."
      />

      <div className="grid gap-6 px-4 pb-10 lg:px-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <CourseForm course={course} categories={cats} instructors={insts} />
        <div className="space-y-6">
          <CurriculumEditor
            courseId={course.id}
            modules={moduleRows}
            lessons={lessonRows}
          />
          <MaterialsEditor
            courseId={course.id}
            materials={materialRows}
            lessons={lessonRows}
          />
        </div>
      </div>
    </div>
  );
}
