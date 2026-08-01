import type { Metadata } from "next";
import Link from "next/link";
import { Bookmark } from "lucide-react";

import { getCurrentUser } from "@/lib/auth";
import { getWatchlist } from "@/lib/queries";
import { PageHeader, EmptyState } from "@/components/app/page-header";
import { Reveal } from "@/components/ui/reveal";
import { Button } from "@/components/ui/button";
import { CourseGridCard } from "@/components/course/course-card";

export const metadata: Metadata = { title: "Minha lista" };

export default async function MinhaListaPage() {
  const user = (await getCurrentUser())!;
  const courses = await getWatchlist(user.id);

  return (
    <div>
      <PageHeader
        eyebrow="Salvos"
        title="Minha lista"
        description="Os cursos que você separou para assistir depois."
      />

      {courses.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="Sua lista está vazia"
          description="Salve cursos para assistir depois clicando em “Adicionar à minha lista”."
          action={
            <Button asChild shimmer>
              <Link href="/explorar">Explorar cursos</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 px-4 sm:grid-cols-2 lg:grid-cols-3 lg:px-8 2xl:grid-cols-4">
          {courses.map((course, i) => (
            <Reveal key={course.id} delay={Math.min(i * 0.04, 0.35)}>
              <CourseGridCard course={course} />
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}
