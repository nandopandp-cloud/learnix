import type { Metadata } from "next";
import Link from "next/link";
import { sql } from "drizzle-orm";
import {
  BookOpen,
  Users,
  PlaySquare,
  LayoutGrid,
  Plus,
  ArrowRight,
} from "lucide-react";

import { db } from "@/db";
import {
  courses,
  lessons,
  users,
  categories,
  enrollments,
  lessonProgress,
} from "@/db/schema";
import { PageHeader } from "@/components/app/page-header";
import { Reveal } from "@/components/ui/reveal";
import { Button } from "@/components/ui/button";
import { Flashlight } from "@/components/ui/flashlight";

export const metadata: Metadata = { title: "Administração" };

export default async function AdminHomePage() {
  const [
    [courseCount],
    [lessonCount],
    [userCount],
    [categoryCount],
    [enrollmentCount],
    [completedCount],
    recentCourses,
  ] = await Promise.all([
    db.select({ n: sql<number>`count(*)::int` }).from(courses),
    db.select({ n: sql<number>`count(*)::int` }).from(lessons),
    db.select({ n: sql<number>`count(*)::int` }).from(users),
    db.select({ n: sql<number>`count(*)::int` }).from(categories),
    db.select({ n: sql<number>`count(*)::int` }).from(enrollments),
    db
      .select({ n: sql<number>`count(*) filter (where ${lessonProgress.completed})::int` })
      .from(lessonProgress),
    db
      .select({
        id: courses.id,
        title: courses.title,
        slug: courses.slug,
        isPublished: courses.isPublished,
        createdAt: courses.createdAt,
      })
      .from(courses)
      .orderBy(sql`${courses.createdAt} desc`)
      .limit(5),
  ]);

  const stats = [
    { icon: BookOpen, label: "Cursos", value: courseCount.n, href: "/admin/cursos" },
    { icon: PlaySquare, label: "Aulas", value: lessonCount.n, href: "/admin/cursos" },
    { icon: Users, label: "Usuários", value: userCount.n, href: "/admin/usuarios" },
    {
      icon: LayoutGrid,
      label: "Categorias",
      value: categoryCount.n,
      href: "/admin/categorias",
    },
  ];

  return (
    <div>
      <PageHeader
        title="Visão geral"
        description="Acompanhe os números da plataforma e gerencie o conteúdo."
        action={
          <Button asChild shimmer>
            <Link href="/admin/cursos/novo">
              <Plus className="h-4 w-4" />
              Novo curso
            </Link>
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-4 px-4 lg:grid-cols-4 lg:px-8">
        {stats.map((stat, i) => (
          <Reveal key={stat.label} delay={i * 0.06}>
            <Link href={stat.href} className="group block">
              <Flashlight className="border-gradient rounded-xl bg-surface-1 p-5 transition-all duration-500 group-hover:-translate-y-1 group-hover:bg-surface-2">
                <stat.icon className="h-5 w-5 text-brand" />
                <p className="mt-3 font-display text-3xl font-bold text-white">
                  {stat.value}
                </p>
                <p className="mt-0.5 text-[0.8rem] text-neutral-500">
                  {stat.label}
                </p>
              </Flashlight>
            </Link>
          </Reveal>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 px-4 lg:grid-cols-2 lg:px-8">
        <Reveal delay={0.2}>
          <div className="rounded-xl bg-surface-1 p-5 ring-1 ring-white/[0.07]">
            <p className="text-[0.8rem] text-neutral-500">Matrículas ativas</p>
            <p className="mt-1.5 font-display text-2xl font-bold text-white">
              {enrollmentCount.n}
            </p>
          </div>
        </Reveal>
        <Reveal delay={0.26}>
          <div className="rounded-xl bg-surface-1 p-5 ring-1 ring-white/[0.07]">
            <p className="text-[0.8rem] text-neutral-500">Aulas concluídas</p>
            <p className="mt-1.5 font-display text-2xl font-bold text-white">
              {completedCount.n}
            </p>
          </div>
        </Reveal>
      </div>

      <section className="mt-8 px-4 lg:px-8">
        <Reveal>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-[1.2rem] font-semibold text-white">
              Cursos recentes
            </h2>
            <Link
              href="/admin/cursos"
              className="group flex items-center gap-1.5 text-[0.8rem] text-brand transition hover:text-brand-bright"
            >
              Ver todos
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </Reveal>

        <ul className="space-y-2">
          {recentCourses.map((course, i) => (
            <Reveal key={course.id} delay={i * 0.05}>
              <Link
                href={`/admin/cursos/${course.id}`}
                className="flex items-center gap-3 rounded-xl bg-surface-1 px-4 py-3.5 ring-1 ring-white/[0.07] transition hover:bg-surface-2 hover:ring-white/15"
              >
                <span className="min-w-0 flex-1 truncate text-[0.9rem] text-white">
                  {course.title}
                </span>
                <span
                  className={
                    course.isPublished
                      ? "shrink-0 rounded-full bg-emerald-500/12 px-2.5 py-1 text-[0.68rem] text-emerald-400"
                      : "shrink-0 rounded-full bg-amber-500/12 px-2.5 py-1 text-[0.68rem] text-amber-400"
                  }
                >
                  {course.isPublished ? "Publicado" : "Rascunho"}
                </span>
                <ArrowRight className="h-4 w-4 shrink-0 text-neutral-600" />
              </Link>
            </Reveal>
          ))}
        </ul>
      </section>
    </div>
  );
}
