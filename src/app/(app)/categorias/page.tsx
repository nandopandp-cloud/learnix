import type { Metadata } from "next";
import Link from "next/link";
import * as Icons from "lucide-react";

import { getCategories, getAllCourses } from "@/lib/queries";
import { PageHeader } from "@/components/app/page-header";
import { Reveal } from "@/components/ui/reveal";
import { Flashlight } from "@/components/ui/flashlight";

export const metadata: Metadata = { title: "Categorias" };

export default async function CategoriasPage() {
  const [cats, courses] = await Promise.all([getCategories(), getAllCourses()]);

  const countBySlug = new Map<string, number>();
  for (const course of courses) {
    if (!course.categoryName) continue;
    const cat = cats.find((c) => c.name === course.categoryName);
    if (cat) countBySlug.set(cat.slug, (countBySlug.get(cat.slug) ?? 0) + 1);
  }

  return (
    <div>
      <PageHeader
        eyebrow="Catálogo"
        title="Categorias"
        description="Navegue pelos temas e encontre o que faz sentido para você agora."
      />

      <div className="grid grid-cols-1 gap-5 px-4 sm:grid-cols-2 lg:grid-cols-3 lg:px-8">
        {cats.map((cat, i) => {
          const Icon =
            (Icons[
              pascal(cat.icon) as keyof typeof Icons
            ] as React.ElementType) ?? Icons.Shapes;
          const count = countBySlug.get(cat.slug) ?? 0;

          return (
            <Reveal key={cat.id} delay={i * 0.06}>
              <Link href={`/explorar?categoria=${cat.slug}`} className="group block">
                <Flashlight className="border-gradient relative overflow-hidden rounded-2xl bg-surface-1 p-6 transition-all duration-500 ease-[var(--ease-out-quint)] group-hover:-translate-y-1.5 group-hover:bg-surface-2">
                  {/* Halo na cor da categoria */}
                  <div
                    className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full opacity-15 blur-3xl transition-opacity duration-500 group-hover:opacity-30"
                    style={{ backgroundColor: cat.color }}
                  />

                  <span
                    className="flex h-12 w-12 items-center justify-center rounded-xl ring-1 transition-transform duration-500 group-hover:scale-110"
                    style={{
                      backgroundColor: `${cat.color}1a`,
                      borderColor: `${cat.color}33`,
                    }}
                  >
                    <Icon className="h-6 w-6" style={{ color: cat.color }} />
                  </span>

                  <h2 className="mt-5 font-display text-xl font-semibold tracking-tight text-white">
                    {cat.name}
                  </h2>
                  <p className="mt-1.5 text-[0.85rem] text-neutral-500">
                    {count} {count === 1 ? "curso disponível" : "cursos disponíveis"}
                  </p>

                  <span className="mt-5 inline-flex items-center gap-1.5 text-[0.82rem] text-neutral-400 transition-colors group-hover:text-white">
                    Ver cursos
                    <Icons.ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                </Flashlight>
              </Link>
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}

function pascal(name: string) {
  return name
    .split("-")
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join("");
}
