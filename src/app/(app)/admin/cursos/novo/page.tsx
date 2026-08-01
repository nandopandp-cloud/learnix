import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { db } from "@/db";
import { categories, instructors } from "@/db/schema";
import { PageHeader } from "@/components/app/page-header";
import { CourseForm } from "../course-form";

export const metadata: Metadata = { title: "Novo curso · Admin" };

export default async function NewCoursePage() {
  const [cats, insts] = await Promise.all([
    db.select().from(categories).orderBy(categories.sortOrder),
    db.select().from(instructors).orderBy(instructors.name),
  ]);

  return (
    <div>
      <div className="px-4 pt-6 lg:px-8">
        <Link
          href="/admin/cursos"
          className="inline-flex items-center gap-1.5 text-[0.82rem] text-neutral-400 transition hover:text-white"
        >
          <ChevronLeft className="h-4 w-4" />
          Voltar aos cursos
        </Link>
      </div>

      <PageHeader
        title="Novo curso"
        description="Preencha os dados e depois adicione os módulos e aulas."
      />

      <div className="max-w-3xl px-4 pb-10 lg:px-8">
        <CourseForm categories={cats} instructors={insts} />
      </div>
    </div>
  );
}
