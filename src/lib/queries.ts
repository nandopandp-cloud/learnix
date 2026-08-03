import "server-only";

import { and, desc, eq, ilike, inArray, or, sql, asc } from "drizzle-orm";

import { db } from "@/db";
import {
  answers,
  categories,
  courseRatings,
  courses,
  enrollments,
  instructors,
  lessonLikes,
  lessonProgress,
  lessons,
  materials,
  modules,
  questions,
  users,
  watchlist,
} from "@/db/schema";

/** Card de curso com o mínimo necessário para as fileiras do dashboard. */
export type CourseCard = {
  id: string;
  title: string;
  slug: string;
  tagline: string | null;
  thumbnailUrl: string | null;
  level: string;
  rating: number;
  isPremium: boolean;
  isNew: boolean;
  totalDuration: number;
  lessonCount: number;
  categoryName: string | null;
  categoryColor: string | null;
  instructorName: string | null;
  /** 0–100, presente quando o usuário já iniciou o curso */
  progress?: number;
  inWatchlist?: boolean;
};

const cardColumns = {
  id: courses.id,
  title: courses.title,
  slug: courses.slug,
  tagline: courses.tagline,
  thumbnailUrl: courses.thumbnailUrl,
  level: courses.level,
  rating: courses.rating,
  isPremium: courses.isPremium,
  isNew: courses.isNew,
  totalDuration: courses.totalDuration,
  categoryName: categories.name,
  categoryColor: categories.color,
  instructorName: instructors.name,
  lessonCount: sql<number>`(
    select count(*)::int from ${lessons} where ${lessons.courseId} = ${courses.id}
  )`.as("lesson_count"),
};

/** Progresso do usuário por curso: % concluído a partir das aulas marcadas. */
async function progressByCourse(userId: string) {
  const rows = await db
    .select({
      courseId: lessonProgress.courseId,
      completed: sql<number>`count(*) filter (where ${lessonProgress.completed})::int`,
      // O total vem do join com courses, cuja coluna id está no GROUP BY —
      // uma subconsulta correlacionada por lessonProgress.courseId aqui
      // escaparia do grupo e contaria as aulas do catálogo inteiro.
      total: sql<number>`(
        select count(*)::int from ${lessons} where ${lessons.courseId} = ${courses.id}
      )`,
    })
    .from(lessonProgress)
    .innerJoin(courses, eq(lessonProgress.courseId, courses.id))
    .where(eq(lessonProgress.userId, userId))
    .groupBy(lessonProgress.courseId, courses.id);

  return new Map(
    rows.map((r) => [
      r.courseId,
      r.total ? Math.round((r.completed / r.total) * 100) : 0,
    ]),
  );
}

/** Cursos em andamento, ordenados pelo acesso mais recente. */
export async function getContinueLearning(
  userId: string,
): Promise<CourseCard[]> {
  // Ordena por último acesso sem trazer a coluna para o payload do card.
  const rows = await db
    .select(cardColumns)
    .from(enrollments)
    .innerJoin(courses, eq(enrollments.courseId, courses.id))
    .leftJoin(categories, eq(courses.categoryId, categories.id))
    .leftJoin(instructors, eq(courses.instructorId, instructors.id))
    .where(eq(enrollments.userId, userId))
    .orderBy(desc(enrollments.lastAccessedAt))
    .limit(10);

  const progress = await progressByCourse(userId);

  return rows
    .map((c) => ({ ...c, progress: progress.get(c.id) ?? 0 }))
    .filter((c) => c.progress < 100);
}

export async function getPopularCourses(limit = 12): Promise<CourseCard[]> {
  return db
    .select(cardColumns)
    .from(courses)
    .leftJoin(categories, eq(courses.categoryId, categories.id))
    .leftJoin(instructors, eq(courses.instructorId, instructors.id))
    .where(eq(courses.isPublished, true))
    .orderBy(desc(courses.ratingCount))
    .limit(limit);
}

export async function getNewCourses(limit = 12): Promise<CourseCard[]> {
  return db
    .select(cardColumns)
    .from(courses)
    .leftJoin(categories, eq(courses.categoryId, categories.id))
    .leftJoin(instructors, eq(courses.instructorId, instructors.id))
    .where(and(eq(courses.isPublished, true), eq(courses.isNew, true)))
    .orderBy(desc(courses.createdAt))
    .limit(limit);
}

export async function getTopRatedCourses(limit = 12): Promise<CourseCard[]> {
  return db
    .select(cardColumns)
    .from(courses)
    .leftJoin(categories, eq(courses.categoryId, categories.id))
    .leftJoin(instructors, eq(courses.instructorId, instructors.id))
    .where(eq(courses.isPublished, true))
    .orderBy(desc(courses.rating), desc(courses.ratingCount))
    .limit(limit);
}

export async function getCoursesByCategory(
  categorySlug: string,
  limit = 12,
): Promise<CourseCard[]> {
  return db
    .select(cardColumns)
    .from(courses)
    .leftJoin(categories, eq(courses.categoryId, categories.id))
    .leftJoin(instructors, eq(courses.instructorId, instructors.id))
    .where(and(eq(courses.isPublished, true), eq(categories.slug, categorySlug)))
    .orderBy(courses.sortOrder)
    .limit(limit);
}

export async function getAllCourses(options?: {
  search?: string;
  categorySlug?: string;
  level?: string;
}): Promise<CourseCard[]> {
  const filters = [eq(courses.isPublished, true)];

  if (options?.search) {
    const term = `%${options.search}%`;
    filters.push(
      or(
        ilike(courses.title, term),
        ilike(courses.tagline, term),
        ilike(courses.description, term),
        ilike(instructors.name, term),
      )!,
    );
  }
  if (options?.categorySlug) {
    filters.push(eq(categories.slug, options.categorySlug));
  }
  if (options?.level) {
    filters.push(eq(courses.level, options.level));
  }

  return db
    .select(cardColumns)
    .from(courses)
    .leftJoin(categories, eq(courses.categoryId, categories.id))
    .leftJoin(instructors, eq(courses.instructorId, instructors.id))
    .where(and(...filters))
    .orderBy(courses.sortOrder);
}

export async function getCategories() {
  return db.select().from(categories).orderBy(categories.sortOrder);
}

/** Curso completo com módulos, aulas e progresso do usuário. */
export async function getCourseBySlug(slug: string, userId?: string) {
  const [course] = await db
    .select({
      id: courses.id,
      title: courses.title,
      slug: courses.slug,
      tagline: courses.tagline,
      description: courses.description,
      thumbnailUrl: courses.thumbnailUrl,
      backdropUrl: courses.backdropUrl,
      level: courses.level,
      language: courses.language,
      rating: courses.rating,
      ratingCount: courses.ratingCount,
      totalDuration: courses.totalDuration,
      isPremium: courses.isPremium,
      learningPoints: courses.learningPoints,
      resourceCount: courses.resourceCount,
      hasCertificate: courses.hasCertificate,
      updatedLabel: courses.updatedLabel,
      categoryName: categories.name,
      categorySlug: categories.slug,
      categoryColor: categories.color,
      instructorId: instructors.id,
      instructorName: instructors.name,
      instructorTitle: instructors.title,
      instructorBio: instructors.bio,
      instructorAvatar: instructors.avatarUrl,
    })
    .from(courses)
    .leftJoin(categories, eq(courses.categoryId, categories.id))
    .leftJoin(instructors, eq(courses.instructorId, instructors.id))
    .where(eq(courses.slug, slug))
    .limit(1);

  if (!course) return null;

  const moduleRows = await db
    .select()
    .from(modules)
    .where(eq(modules.courseId, course.id))
    .orderBy(modules.sortOrder);

  const lessonRows = await db
    .select()
    .from(lessons)
    .where(eq(lessons.courseId, course.id))
    .orderBy(lessons.sortOrder);

  const progressRows = userId
    ? await db
        .select()
        .from(lessonProgress)
        .where(
          and(
            eq(lessonProgress.userId, userId),
            eq(lessonProgress.courseId, course.id),
          ),
        )
    : [];

  const progressByLesson = new Map(progressRows.map((p) => [p.lessonId, p]));

  const modulesWithLessons = moduleRows.map((m) => ({
    ...m,
    lessons: lessonRows
      .filter((l) => l.moduleId === m.id)
      .map((l) => ({
        ...l,
        completed: progressByLesson.get(l.id)?.completed ?? false,
        positionSeconds: progressByLesson.get(l.id)?.positionSeconds ?? 0,
      })),
  }));

  const completedCount = progressRows.filter((p) => p.completed).length;
  const progress = lessonRows.length
    ? Math.round((completedCount / lessonRows.length) * 100)
    : 0;

  const [enrollment] = userId
    ? await db
        .select()
        .from(enrollments)
        .where(
          and(
            eq(enrollments.userId, userId),
            eq(enrollments.courseId, course.id),
          ),
        )
        .limit(1)
    : [];

  const [saved] = userId
    ? await db
        .select()
        .from(watchlist)
        .where(
          and(eq(watchlist.userId, userId), eq(watchlist.courseId, course.id)),
        )
        .limit(1)
    : [];

  const courseMaterials = await db
    .select()
    .from(materials)
    .where(eq(materials.courseId, course.id))
    .orderBy(materials.sortOrder);

  /** Próxima aula a assistir: a primeira não concluída. */
  const nextLesson =
    lessonRows.find((l) => !progressByLesson.get(l.id)?.completed) ??
    lessonRows[0];

  return {
    ...course,
    modules: modulesWithLessons,
    lessons: lessonRows,
    lessonCount: lessonRows.length,
    materials: courseMaterials,
    progress,
    completedCount,
    isEnrolled: Boolean(enrollment),
    inWatchlist: Boolean(saved),
    nextLesson,
  };
}

export type CourseDetail = NonNullable<
  Awaited<ReturnType<typeof getCourseBySlug>>
>;

/** Dados da tela do player: aula atual + playlist completa do curso. */
export async function getLessonView(
  courseSlug: string,
  lessonSlug: string,
  userId: string,
) {
  const course = await getCourseBySlug(courseSlug, userId);
  if (!course) return null;

  const current = course.lessons.find((l) => l.slug === lessonSlug);
  if (!current) return null;

  const index = course.lessons.findIndex((l) => l.id === current.id);
  const prev = index > 0 ? course.lessons[index - 1] : null;
  const next =
    index < course.lessons.length - 1 ? course.lessons[index + 1] : null;

  const [progress] = await db
    .select()
    .from(lessonProgress)
    .where(
      and(
        eq(lessonProgress.userId, userId),
        eq(lessonProgress.lessonId, current.id),
      ),
    )
    .limit(1);

  const lessonMaterials = await db
    .select()
    .from(materials)
    .where(
      and(
        eq(materials.courseId, course.id),
        or(
          eq(materials.lessonId, current.id),
          sql`${materials.lessonId} is null`,
        ),
      )!,
    )
    .orderBy(materials.sortOrder);

  const [{ likeCount }] = await db
    .select({ likeCount: sql<number>`count(*)::int` })
    .from(lessonLikes)
    .where(eq(lessonLikes.lessonId, current.id));

  const [likedRow] = await db
    .select({ id: lessonLikes.id })
    .from(lessonLikes)
    .where(
      and(eq(lessonLikes.userId, userId), eq(lessonLikes.lessonId, current.id)),
    )
    .limit(1);

  return {
    course,
    lesson: current,
    materials: lessonMaterials,
    position: progress?.positionSeconds ?? 0,
    completed: progress?.completed ?? false,
    likeCount,
    liked: Boolean(likedRow),
    prev,
    next,
    index,
  };
}

export async function getWatchlist(userId: string): Promise<CourseCard[]> {
  const rows = await db
    .select(cardColumns)
    .from(watchlist)
    .innerJoin(courses, eq(watchlist.courseId, courses.id))
    .leftJoin(categories, eq(courses.categoryId, categories.id))
    .leftJoin(instructors, eq(courses.instructorId, instructors.id))
    .where(eq(watchlist.userId, userId))
    .orderBy(desc(watchlist.createdAt));

  const progress = await progressByCourse(userId);
  return rows.map((c) => ({
    ...c,
    progress: progress.get(c.id),
    inWatchlist: true,
  }));
}

/** Todos os cursos que o usuário iniciou, incluindo os concluídos. */
export async function getMyCourses(userId: string): Promise<CourseCard[]> {
  const rows = await db
    .select(cardColumns)
    .from(enrollments)
    .innerJoin(courses, eq(enrollments.courseId, courses.id))
    .leftJoin(categories, eq(courses.categoryId, categories.id))
    .leftJoin(instructors, eq(courses.instructorId, instructors.id))
    .where(eq(enrollments.userId, userId))
    .orderBy(desc(enrollments.lastAccessedAt));

  const progress = await progressByCourse(userId);
  return rows.map((c) => ({ ...c, progress: progress.get(c.id) ?? 0 }));
}

/** Histórico: aulas assistidas recentemente. */
export async function getHistory(userId: string, limit = 30) {
  return db
    .select({
      lessonId: lessons.id,
      lessonTitle: lessons.title,
      lessonSlug: lessons.slug,
      duration: lessons.duration,
      positionSeconds: lessonProgress.positionSeconds,
      completed: lessonProgress.completed,
      updatedAt: lessonProgress.updatedAt,
      courseTitle: courses.title,
      courseSlug: courses.slug,
      thumbnailUrl: courses.thumbnailUrl,
      categoryName: categories.name,
    })
    .from(lessonProgress)
    .innerJoin(lessons, eq(lessonProgress.lessonId, lessons.id))
    .innerJoin(courses, eq(lessonProgress.courseId, courses.id))
    .leftJoin(categories, eq(courses.categoryId, categories.id))
    .where(eq(lessonProgress.userId, userId))
    .orderBy(desc(lessonProgress.updatedAt))
    .limit(limit);
}

/** Cursos 100% concluídos, base da página de certificados. */
export async function getCertificates(userId: string) {
  const rows = await db
    .select({
      courseId: courses.id,
      title: courses.title,
      slug: courses.slug,
      thumbnailUrl: courses.thumbnailUrl,
      totalDuration: courses.totalDuration,
      categoryName: categories.name,
      instructorName: instructors.name,
      completed: sql<number>`count(*) filter (where ${lessonProgress.completed})::int`,
      total: sql<number>`(
        select count(*)::int from ${lessons} where ${lessons.courseId} = ${courses.id}
      )`,
      finishedAt: sql<string>`max(${lessonProgress.updatedAt})`,
    })
    .from(lessonProgress)
    .innerJoin(courses, eq(lessonProgress.courseId, courses.id))
    .leftJoin(categories, eq(courses.categoryId, categories.id))
    .leftJoin(instructors, eq(courses.instructorId, instructors.id))
    .where(eq(lessonProgress.userId, userId))
    .groupBy(
      courses.id,
      courses.title,
      courses.slug,
      courses.thumbnailUrl,
      courses.totalDuration,
      categories.name,
      instructors.name,
    );

  return rows.filter((r) => r.total > 0 && r.completed === r.total);
}

/** Métricas do topo do dashboard. */
export async function getUserStats(userId: string) {
  const [row] = await db
    .select({
      watched: sql<number>`count(*) filter (where ${lessonProgress.completed})::int`,
      seconds: sql<number>`coalesce(sum(${lessonProgress.positionSeconds}), 0)::int`,
      courses: sql<number>`count(distinct ${lessonProgress.courseId})::int`,
    })
    .from(lessonProgress)
    .where(eq(lessonProgress.userId, userId));

  const certificates = (await getCertificates(userId)).length;

  return {
    lessonsWatched: row?.watched ?? 0,
    secondsWatched: row?.seconds ?? 0,
    coursesStarted: row?.courses ?? 0,
    certificates,
  };
}

/** Busca rápida usada pelo comando da topbar. */
export async function searchCourses(term: string, limit = 8) {
  if (!term.trim()) return [];
  const pattern = `%${term.trim()}%`;

  return db
    .select({
      id: courses.id,
      title: courses.title,
      slug: courses.slug,
      thumbnailUrl: courses.thumbnailUrl,
      categoryName: categories.name,
      instructorName: instructors.name,
      lessonCount: sql<number>`(
        select count(*)::int from ${lessons} where ${lessons.courseId} = ${courses.id}
      )`,
    })
    .from(courses)
    .leftJoin(categories, eq(courses.categoryId, categories.id))
    .leftJoin(instructors, eq(courses.instructorId, instructors.id))
    .where(
      and(
        eq(courses.isPublished, true),
        or(
          ilike(courses.title, pattern),
          ilike(courses.tagline, pattern),
          ilike(instructors.name, pattern),
          ilike(categories.name, pattern),
        ),
      ),
    )
    .limit(limit);
}

/* ------------------------------- avaliações -------------------------------- */

export type CourseReviews = Awaited<ReturnType<typeof getCourseReviews>>;

/**
 * Resumo de avaliações do curso: média e distribuição vêm agregadas do banco,
 * e a lista traz só quem escreveu comentário (nota sem texto conta para a
 * média, mas não rende um card vazio na aba).
 */
export async function getCourseReviews(courseId: string, userId?: string) {
  const [summary] = await db
    .select({
      average: sql<number>`coalesce(avg(${courseRatings.stars}), 0)::float`,
      count: sql<number>`count(*)::int`,
      s5: sql<number>`count(*) filter (where ${courseRatings.stars} = 5)::int`,
      s4: sql<number>`count(*) filter (where ${courseRatings.stars} = 4)::int`,
      s3: sql<number>`count(*) filter (where ${courseRatings.stars} = 3)::int`,
      s2: sql<number>`count(*) filter (where ${courseRatings.stars} = 2)::int`,
      s1: sql<number>`count(*) filter (where ${courseRatings.stars} = 1)::int`,
    })
    .from(courseRatings)
    .where(eq(courseRatings.courseId, courseId));

  const list = await db
    .select({
      id: courseRatings.id,
      stars: courseRatings.stars,
      comment: courseRatings.comment,
      createdAt: courseRatings.createdAt,
      userId: courseRatings.userId,
      authorName: users.name,
      authorAvatar: users.avatarUrl,
    })
    .from(courseRatings)
    .innerJoin(users, eq(users.id, courseRatings.userId))
    .where(
      and(
        eq(courseRatings.courseId, courseId),
        sql`${courseRatings.comment} is not null and ${courseRatings.comment} <> ''`,
      ),
    )
    .orderBy(desc(courseRatings.createdAt))
    .limit(50);

  const [mine] = userId
    ? await db
        .select({
          stars: courseRatings.stars,
          comment: courseRatings.comment,
        })
        .from(courseRatings)
        .where(
          and(
            eq(courseRatings.userId, userId),
            eq(courseRatings.courseId, courseId),
          ),
        )
        .limit(1)
    : [];

  const total = summary.count;
  const pct = (n: number) => (total > 0 ? Math.round((n / total) * 100) : 0);

  return {
    average: summary.average,
    count: total,
    distribution: [
      { stars: 5, count: summary.s5, pct: pct(summary.s5) },
      { stars: 4, count: summary.s4, pct: pct(summary.s4) },
      { stars: 3, count: summary.s3, pct: pct(summary.s3) },
      { stars: 2, count: summary.s2, pct: pct(summary.s2) },
      { stars: 1, count: summary.s1, pct: pct(summary.s1) },
    ],
    reviews: list,
    myRating: mine ?? null,
  };
}

/* ---------------------------------- Q&A ------------------------------------ */

export type CourseQuestions = Awaited<ReturnType<typeof getCourseQuestions>>;

/** Perguntas do curso com suas respostas aninhadas, mais recentes primeiro. */
export async function getCourseQuestions(courseId: string) {
  const questionRows = await db
    .select({
      id: questions.id,
      content: questions.content,
      createdAt: questions.createdAt,
      userId: questions.userId,
      authorName: users.name,
      authorAvatar: users.avatarUrl,
      authorRole: users.role,
      lessonId: questions.lessonId,
      lessonTitle: lessons.title,
    })
    .from(questions)
    .innerJoin(users, eq(users.id, questions.userId))
    .leftJoin(lessons, eq(lessons.id, questions.lessonId))
    .where(eq(questions.courseId, courseId))
    .orderBy(desc(questions.createdAt))
    .limit(100);

  if (questionRows.length === 0) return [];

  const answerRows = await db
    .select({
      id: answers.id,
      questionId: answers.questionId,
      content: answers.content,
      createdAt: answers.createdAt,
      userId: answers.userId,
      authorName: users.name,
      authorAvatar: users.avatarUrl,
      authorRole: users.role,
    })
    .from(answers)
    .innerJoin(users, eq(users.id, answers.userId))
    .where(
      inArray(
        answers.questionId,
        questionRows.map((q) => q.id),
      ),
    )
    .orderBy(asc(answers.createdAt));

  const byQuestion = new Map<string, typeof answerRows>();
  for (const answer of answerRows) {
    const list = byQuestion.get(answer.questionId) ?? [];
    list.push(answer);
    byQuestion.set(answer.questionId, list);
  }

  return questionRows.map((q) => ({
    ...q,
    answers: byQuestion.get(q.id) ?? [],
  }));
}

export { asc, inArray };
