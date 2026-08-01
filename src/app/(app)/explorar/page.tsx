import type { Metadata } from "next";
import { SearchX } from "lucide-react";

import { getAllCourses, getCategories } from "@/lib/queries";
import { PageHeader, EmptyState } from "@/components/app/page-header";
import { Reveal } from "@/components/ui/reveal";
import { CourseGridCard } from "@/components/course/course-card";
import { ExploreFilters } from "./filters";

export const metadata: Metadata = { title: "Explorar" };

export default async function ExplorarPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; categoria?: string; nivel?: string }>;
}) {
  const { q, categoria, nivel } = await searchParams;

  const [courses, cats] = await Promise.all([
    getAllCourses({ search: q, categorySlug: categoria, level: nivel }),
    getCategories(),
  ]);

  const activeCategory = cats.find((c) => c.slug === categoria);

  return (
    <div>
      <PageHeader
        eyebrow="Catálogo"
        title={activeCategory ? activeCategory.name : "Explorar cursos"}
        description={
          q
            ? `Resultados para “${q}”`
            : "Encontre o próximo curso que vai destravar sua evolução."
        }
      />

      <div className="px-4 lg:px-8">
        <ExploreFilters categories={cats} />
      </div>

      {courses.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            icon={SearchX}
            title="Nenhum curso encontrado"
            description="Tente ajustar os filtros ou buscar por outro termo."
          />
        </div>
      ) : (
        <>
          <p className="px-4 pt-6 pb-4 text-[0.82rem] text-neutral-500 lg:px-8">
            {courses.length} {courses.length === 1 ? "curso" : "cursos"}
          </p>
          <div className="grid grid-cols-1 gap-5 px-4 sm:grid-cols-2 lg:grid-cols-3 lg:px-8 2xl:grid-cols-4">
            {courses.map((course, i) => (
              <Reveal key={course.id} delay={Math.min(i * 0.04, 0.4)}>
                <CourseGridCard course={course} />
              </Reveal>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
