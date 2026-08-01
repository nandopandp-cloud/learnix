import Link from "next/link";
import Image from "next/image";
import { Play, Info, Star, Clock, Sparkles } from "lucide-react";
import * as Icons from "lucide-react";

import { getCurrentUser } from "@/lib/auth";
import {
  getCategories,
  getContinueLearning,
  getNewCourses,
  getPopularCourses,
  getTopRatedCourses,
  getCoursesByCategory,
} from "@/lib/queries";
import { formatDuration } from "@/lib/utils";
import { Reveal } from "@/components/ui/reveal";
import { Button } from "@/components/ui/button";
import { CourseRow, RowItem } from "@/components/course/course-row";
import {
  CourseCard,
  ContinueCard,
} from "@/components/course/course-card";

export default async function InicioPage() {
  const user = (await getCurrentUser())!;

  const [continueLearning, popular, novos, topRated, cats, devCourses] =
    await Promise.all([
      getContinueLearning(user.id),
      getPopularCourses(),
      getNewCourses(),
      getTopRatedCourses(),
      getCategories(),
      getCoursesByCategory("desenvolvimento"),
    ]);

  /* Destaque do hero: o curso em andamento mais recente ou o mais popular. */
  const featured = continueLearning[0] ?? popular[0];
  const firstName = user.name.split(" ")[0];

  return (
    <div className="pb-10">
      {featured && <Hero course={featured} greeting={firstName} />}

      <div className="mt-10 space-y-12">
        {continueLearning.length > 0 && (
          <CourseRow title="Continue aprendendo" href="/cursos">
            {continueLearning.map((course, i) => (
              <RowItem key={course.id} index={i}>
                <ContinueCard course={course} />
              </RowItem>
            ))}
          </CourseRow>
        )}

        <CategoryChips categories={cats} />

        <CourseRow title="Populares na Learnix" href="/explorar" delay={0.05}>
          {popular.map((course, i) => (
            <RowItem key={course.id} index={i}>
              <CourseCard course={course} />
            </RowItem>
          ))}
        </CourseRow>

        {novos.length > 0 && (
          <CourseRow title="Novos lançamentos" href="/explorar?novos=1">
            {novos.map((course, i) => (
              <RowItem key={course.id} index={i}>
                <CourseCard course={course} />
              </RowItem>
            ))}
          </CourseRow>
        )}

        <CourseRow title="Mais bem avaliados" href="/explorar">
          {topRated.map((course, i) => (
            <RowItem key={course.id} index={i}>
              <CourseCard course={course} />
            </RowItem>
          ))}
        </CourseRow>

        {devCourses.length > 0 && (
          <CourseRow
            title="Desenvolvimento"
            href="/explorar?categoria=desenvolvimento"
          >
            {devCourses.map((course, i) => (
              <RowItem key={course.id} index={i}>
                <CourseCard course={course} />
              </RowItem>
            ))}
          </CourseRow>
        )}
      </div>
    </div>
  );
}

/* --------------------------------- hero ---------------------------------- */

function Hero({
  course,
  greeting,
}: {
  course: Awaited<ReturnType<typeof getPopularCourses>>[number];
  greeting: string;
}) {
  return (
    <section className="relative -mt-[var(--topbar-h)] h-[30rem] w-full overflow-hidden sm:h-[34rem]">
      {course.thumbnailUrl && (
        <Image
          src={course.thumbnailUrl}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      )}

      {/* Gradientes que ancoram o texto e fundem o hero na página */}
      <div className="absolute inset-0 bg-gradient-to-r from-void via-void/85 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-void via-void/25 to-void/70" />

      <div className="relative flex h-full flex-col justify-end px-4 pb-12 lg:px-8">
        <Reveal delay={0.1}>
          <p className="flex items-center gap-2 font-mono text-[0.68rem] tracking-[0.24em] text-neutral-400 uppercase">
            <Sparkles className="h-3.5 w-3.5 text-brand" />
            Olá, {greeting} — continue de onde parou
          </p>
        </Reveal>

        <Reveal delay={0.2}>
          <h1 className="mt-4 max-w-2xl font-display text-4xl leading-[1.05] font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            {course.title}
          </h1>
        </Reveal>

        {course.tagline && (
          <Reveal delay={0.3}>
            <p className="mt-4 max-w-xl text-[0.95rem] leading-relaxed text-neutral-300">
              {course.tagline}
            </p>
          </Reveal>
        )}

        <Reveal delay={0.4}>
          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-[0.8rem] text-neutral-400">
            <span className="flex items-center gap-1.5">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span className="text-white">
                {course.rating.toFixed(1).replace(".", ",")}
              </span>
            </span>
            <span className="h-1 w-1 rounded-full bg-neutral-700" />
            <span>{course.level}</span>
            <span className="h-1 w-1 rounded-full bg-neutral-700" />
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {formatDuration(course.totalDuration)}
            </span>
            <span className="h-1 w-1 rounded-full bg-neutral-700" />
            <span>{course.lessonCount} aulas</span>
          </div>
        </Reveal>

        {course.progress !== undefined && course.progress > 0 && (
          <Reveal delay={0.45}>
            <div className="mt-5 max-w-sm">
              <div className="mb-2 flex justify-between text-[0.72rem] text-neutral-400">
                <span>Seu progresso</span>
                <span className="text-white">{course.progress}% concluído</span>
              </div>
              <div className="h-1 overflow-hidden rounded-full bg-white/15">
                <div
                  className="h-full rounded-full bg-brand"
                  style={{ width: `${course.progress}%` }}
                />
              </div>
            </div>
          </Reveal>
        )}

        <Reveal delay={0.55}>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Button asChild size="lg" shimmer>
              <Link href={`/cursos/${course.slug}`}>
                <Play className="h-4 w-4 fill-current" />
                {course.progress ? "Continuar assistindo" : "Começar agora"}
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href={`/cursos/${course.slug}`}>
                <Info className="h-4 w-4" />
                Mais informações
              </Link>
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------- categorias ------------------------------- */

function CategoryChips({
  categories,
}: {
  categories: Awaited<ReturnType<typeof getCategories>>;
}) {
  return (
    <section>
      <Reveal className="mb-4 px-4 lg:px-8">
        <h2 className="font-display text-[1.35rem] font-semibold tracking-tight text-white">
          Categorias
        </h2>
      </Reveal>

      <div className="hide-scrollbar flex gap-3 overflow-x-auto px-4 pb-2 lg:px-8">
        {categories.map((cat, i) => {
          const Icon =
            (Icons[
              pascal(cat.icon) as keyof typeof Icons
            ] as React.ElementType) ?? Icons.Shapes;

          return (
            <Reveal key={cat.id} delay={i * 0.05}>
              <Link
                href={`/explorar?categoria=${cat.slug}`}
                className="border-gradient group flex shrink-0 items-center gap-2.5 rounded-xl bg-surface-1 px-5 py-3.5 transition-all duration-400 ease-[var(--ease-out-quint)] hover:-translate-y-1 hover:bg-surface-2"
              >
                <Icon
                  className="h-[1.15rem] w-[1.15rem] transition-transform duration-400 group-hover:scale-110"
                  style={{ color: cat.color }}
                />
                <span className="text-sm font-medium whitespace-nowrap text-neutral-200 transition-colors group-hover:text-white">
                  {cat.name}
                </span>
              </Link>
            </Reveal>
          );
        })}

        <Reveal delay={categories.length * 0.05}>
          <Link
            href="/categorias"
            className="border-gradient group flex shrink-0 items-center gap-2.5 rounded-xl bg-surface-1 px-5 py-3.5 transition-all duration-400 hover:-translate-y-1 hover:bg-surface-2"
          >
            <Icons.LayoutGrid className="h-[1.15rem] w-[1.15rem] text-neutral-400" />
            <span className="text-sm font-medium whitespace-nowrap text-neutral-200">
              Ver todas
            </span>
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

/** "code-xml" -> "CodeXml", para casar com os exports do lucide-react. */
function pascal(name: string) {
  return name
    .split("-")
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join("");
}
