import type { Metadata } from "next";
import Link from "next/link";
import { GraduationCap } from "lucide-react";

import { getCurrentUser } from "@/lib/auth";
import { getMyCourses } from "@/lib/queries";
import { PageHeader, EmptyState } from "@/components/app/page-header";
import { Reveal } from "@/components/ui/reveal";
import { Button } from "@/components/ui/button";
import { CourseGridCard } from "@/components/course/course-card";

export const metadata: Metadata = { title: "Meus cursos" };

export default async function MeusCursosPage() {
  const user = (await getCurrentUser())!;
  const courses = await getMyCourses(user.id);

  const emAndamento = courses.filter((c) => (c.progress ?? 0) < 100);
  const concluidos = courses.filter((c) => (c.progress ?? 0) === 100);

  return (
    <div>
      <PageHeader
        eyebrow="Sua jornada"
        title="Meus cursos"
        description="Todos os cursos que você começou, em um só lugar."
      />

      {courses.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title="Você ainda não começou nenhum curso"
          description="Explore o catálogo e escolha o primeiro curso da sua jornada."
          action={
            <Button asChild shimmer>
              <Link href="/explorar">Explorar catálogo</Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-10">
          {emAndamento.length > 0 && (
            <Section title="Em andamento" courses={emAndamento} />
          )}
          {concluidos.length > 0 && (
            <Section title="Concluídos" courses={concluidos} />
          )}
        </div>
      )}
    </div>
  );
}

function Section({
  title,
  courses,
}: {
  title: string;
  courses: Awaited<ReturnType<typeof getMyCourses>>;
}) {
  return (
    <section>
      <Reveal className="px-4 pb-4 lg:px-8">
        <h2 className="font-display text-[1.3rem] font-semibold tracking-tight text-white">
          {title}
          <span className="ml-2 text-[0.9rem] font-normal text-neutral-600">
            {courses.length}
          </span>
        </h2>
      </Reveal>

      <div className="grid grid-cols-1 gap-5 px-4 sm:grid-cols-2 lg:grid-cols-3 lg:px-8 2xl:grid-cols-4">
        {courses.map((course, i) => (
          <Reveal key={course.id} delay={Math.min(i * 0.04, 0.35)}>
            <CourseGridCard course={course} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
