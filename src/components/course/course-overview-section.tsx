"use client";

import { useState } from "react";
import { Reveal } from "@/components/ui/reveal";
import { CourseTabNav, CourseTabs } from "@/components/course/course-tabs";
import type { CourseDetail } from "@/lib/queries";

/**
 * Junta a navegação de abas (largura total) com o grid de conteúdo + aside.
 * A navegação fica fora do grid para que o aside comece alinhado ao título
 * de cada aba, não à barra de abas.
 */
export function CourseOverviewSection({
  course,
  aside,
}: {
  course: CourseDetail;
  aside: React.ReactNode;
}) {
  const [active, setActive] = useState<
    "Overview" | "Conteúdo do curso" | "Materiais" | "Avaliações" | "Perguntas"
  >("Overview");

  return (
    <div className="px-4 py-8 lg:px-10">
      <Reveal>
        <CourseTabNav active={active} onChange={setActive} />
      </Reveal>

      <div className="grid gap-8 pt-7 xl:grid-cols-[1fr_20rem]">
        <div className="min-w-0">
          <CourseTabs course={course} active={active} />
        </div>
        <aside className="space-y-5">{aside}</aside>
      </div>
    </div>
  );
}
