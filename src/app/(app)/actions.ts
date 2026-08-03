"use server";

import { revalidatePath } from "next/cache";
import { and, eq, sql } from "drizzle-orm";

import { db } from "@/db";
import {
  answers,
  courseRatings,
  courses,
  enrollments,
  lessonLikes,
  lessonProgress,
  lessons,
  notes,
  questions,
  users,
  watchlist,
} from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { canAccessPremium } from "@/lib/queries";

/**
 * Uma aula paga não pode registrar progresso nem matrícula por chamada direta
 * à server action — a trava da UI sozinha seria contornável.
 */
async function isLessonLocked(lessonId: string) {
  const user = await getCurrentUser();
  if (canAccessPremium(user)) return false;

  const [row] = await db
    .select({ isPremium: courses.isPremium, isFree: lessons.isFree })
    .from(lessons)
    .innerJoin(courses, eq(lessons.courseId, courses.id))
    .where(eq(lessons.id, lessonId))
    .limit(1);

  return Boolean(row && row.isPremium && !row.isFree);
}

/** Atualiza a foto de perfil do usuário logado. */
export async function updateAvatar(avatarUrl: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Não autenticado." };

  await db
    .update(users)
    .set({ avatarUrl: avatarUrl.trim() || null })
    .where(eq(users.id, user.id));

  revalidatePath("/configuracoes");
  revalidatePath("/inicio");
  return { success: true };
}

/** Atualiza o nome de exibição do usuário logado. */
export async function updateName(name: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Não autenticado." };

  const trimmed = name.trim().replace(/\s+/g, " ");
  if (trimmed.length < 2) {
    return { error: "O nome precisa ter ao menos 2 caracteres." };
  }
  if (trimmed.length > 60) {
    return { error: "O nome pode ter no máximo 60 caracteres." };
  }

  await db.update(users).set({ name: trimmed }).where(eq(users.id, user.id));

  // O nome aparece na topbar e nas saudações, então o layout inteiro
  // precisa ser revalidado, não só a página de configurações.
  revalidatePath("/", "layout");
  return { success: true, name: trimmed };
}

/** Salva/remove um curso da lista do usuário. Retorna o novo estado. */
export async function toggleWatchlist(courseId: string) {
  const user = await getCurrentUser();
  if (!user) return { saved: false };

  const [existing] = await db
    .select()
    .from(watchlist)
    .where(and(eq(watchlist.userId, user.id), eq(watchlist.courseId, courseId)))
    .limit(1);

  if (existing) {
    await db.delete(watchlist).where(eq(watchlist.id, existing.id));
    revalidatePath("/minha-lista");
    return { saved: false };
  }

  await db.insert(watchlist).values({ userId: user.id, courseId });
  revalidatePath("/minha-lista");
  return { saved: true };
}

/** Matricula o usuário (idempotente) e marca o acesso mais recente. */
export async function ensureEnrollment(courseId: string) {
  const user = await getCurrentUser();
  if (!user) return;

  await db
    .insert(enrollments)
    .values({ userId: user.id, courseId })
    .onConflictDoUpdate({
      target: [enrollments.userId, enrollments.courseId],
      set: { lastAccessedAt: new Date() },
    });
}

/**
 * Persiste a posição do vídeo. Chamado periodicamente pelo player,
 * então evita revalidar rotas a cada tique.
 */
export async function saveProgress(
  lessonId: string,
  courseId: string,
  positionSeconds: number,
  completed = false,
) {
  const user = await getCurrentUser();
  if (!user) return;
  if (await isLessonLocked(lessonId)) return;

  await db
    .insert(lessonProgress)
    .values({
      userId: user.id,
      lessonId,
      courseId,
      positionSeconds: Math.floor(positionSeconds),
      completed,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [lessonProgress.userId, lessonProgress.lessonId],
      set: {
        positionSeconds: Math.floor(positionSeconds),
        // uma aula concluída não volta a ficar pendente por reassistir
        ...(completed ? { completed: true } : {}),
        updatedAt: new Date(),
      },
    });

  await db
    .update(enrollments)
    .set({ lastAccessedAt: new Date() })
    .where(
      and(eq(enrollments.userId, user.id), eq(enrollments.courseId, courseId)),
    );
}

/** Alterna manualmente o "concluído" de uma aula. */
export async function toggleLessonComplete(lessonId: string, courseId: string) {
  const user = await getCurrentUser();
  if (!user) return { completed: false };
  if (await isLessonLocked(lessonId)) return { completed: false };

  const [existing] = await db
    .select()
    .from(lessonProgress)
    .where(
      and(
        eq(lessonProgress.userId, user.id),
        eq(lessonProgress.lessonId, lessonId),
      ),
    )
    .limit(1);

  const next = !existing?.completed;

  if (existing) {
    await db
      .update(lessonProgress)
      .set({ completed: next, updatedAt: new Date() })
      .where(eq(lessonProgress.id, existing.id));
  } else {
    const [lesson] = await db
      .select({ duration: lessons.duration })
      .from(lessons)
      .where(eq(lessons.id, lessonId))
      .limit(1);

    await db.insert(lessonProgress).values({
      userId: user.id,
      lessonId,
      courseId,
      positionSeconds: next ? (lesson?.duration ?? 0) : 0,
      completed: next,
    });
  }

  revalidatePath("/inicio");
  revalidatePath("/cursos");
  return { completed: next };
}

/** Curtida real de aula: alterna e devolve o novo total, contado no banco. */
export async function toggleLessonLike(lessonId: string) {
  const user = await getCurrentUser();
  if (!user) return { liked: false, count: 0 };

  const [existing] = await db
    .select()
    .from(lessonLikes)
    .where(
      and(eq(lessonLikes.userId, user.id), eq(lessonLikes.lessonId, lessonId)),
    )
    .limit(1);

  if (existing) {
    await db.delete(lessonLikes).where(eq(lessonLikes.id, existing.id));
  } else {
    await db
      .insert(lessonLikes)
      .values({ userId: user.id, lessonId })
      .onConflictDoNothing();
  }

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(lessonLikes)
    .where(eq(lessonLikes.lessonId, lessonId));

  return { liked: !existing, count };
}

/** Estado inicial de curtida para renderizar o player já com o dado certo. */
export async function getLessonLikeState(lessonId: string) {
  const user = await getCurrentUser();

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(lessonLikes)
    .where(eq(lessonLikes.lessonId, lessonId));

  if (!user) return { liked: false, count };

  const [existing] = await db
    .select({ id: lessonLikes.id })
    .from(lessonLikes)
    .where(
      and(eq(lessonLikes.userId, user.id), eq(lessonLikes.lessonId, lessonId)),
    )
    .limit(1);

  return { liked: Boolean(existing), count };
}

export async function addNote(
  lessonId: string,
  content: string,
  timestampSeconds: number,
) {
  const user = await getCurrentUser();
  if (!user || !content.trim()) return;

  await db.insert(notes).values({
    userId: user.id,
    lessonId,
    content: content.trim(),
    timestampSeconds: Math.floor(timestampSeconds),
  });
}

export async function deleteNote(noteId: string) {
  const user = await getCurrentUser();
  if (!user) return;

  await db
    .delete(notes)
    .where(and(eq(notes.id, noteId), eq(notes.userId, user.id)));
}

export async function getNotes(lessonId: string) {
  const user = await getCurrentUser();
  if (!user) return [];

  return db
    .select()
    .from(notes)
    .where(and(eq(notes.userId, user.id), eq(notes.lessonId, lessonId)))
    .orderBy(notes.timestampSeconds);
}

/* ------------------------------- avaliações -------------------------------- */

/**
 * Recalcula média e total do curso a partir das notas individuais.
 * As colunas em `courses` são denormalizadas porque aparecem nas listagens,
 * onde agregar por curso sairia caro.
 */
async function syncCourseRating(courseId: string) {
  const [agg] = await db
    .select({
      average: sql<number>`coalesce(avg(${courseRatings.stars}), 0)::float`,
      count: sql<number>`count(*)::int`,
    })
    .from(courseRatings)
    .where(eq(courseRatings.courseId, courseId));

  await db
    .update(courses)
    .set({ rating: agg.average, ratingCount: agg.count })
    .where(eq(courses.id, courseId));

  return agg;
}

/** Cria ou atualiza a avaliação do usuário logado para o curso. */
export async function rateCourse(
  courseId: string,
  stars: number,
  comment: string,
) {
  const user = await getCurrentUser();
  if (!user) return { error: "Entre na sua conta para avaliar." };
  if (stars < 1 || stars > 5) return { error: "Escolha de 1 a 5 estrelas." };

  const trimmed = comment.trim();

  await db
    .insert(courseRatings)
    .values({
      userId: user.id,
      courseId,
      stars,
      comment: trimmed || null,
    })
    .onConflictDoUpdate({
      target: [courseRatings.userId, courseRatings.courseId],
      set: { stars, comment: trimmed || null, updatedAt: new Date() },
    });

  await syncCourseRating(courseId);

  const [course] = await db
    .select({ slug: courses.slug })
    .from(courses)
    .where(eq(courses.id, courseId))
    .limit(1);

  if (course) revalidatePath(`/cursos/${course.slug}`);
  return { success: true };
}

/** Remove a avaliação do usuário logado. */
export async function deleteMyRating(courseId: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Não autenticado." };

  await db
    .delete(courseRatings)
    .where(
      and(
        eq(courseRatings.userId, user.id),
        eq(courseRatings.courseId, courseId),
      ),
    );

  await syncCourseRating(courseId);

  const [course] = await db
    .select({ slug: courses.slug })
    .from(courses)
    .where(eq(courses.id, courseId))
    .limit(1);

  if (course) revalidatePath(`/cursos/${course.slug}`);
  return { success: true };
}

/* ---------------------------------- Q&A ------------------------------------ */

/** Publica uma pergunta no curso (opcionalmente atrelada a uma aula). */
export async function askQuestion(
  courseId: string,
  content: string,
  lessonId?: string,
) {
  const user = await getCurrentUser();
  if (!user) return { error: "Entre na sua conta para perguntar." };

  const trimmed = content.trim();
  if (!trimmed) return { error: "Escreva sua pergunta." };

  await db.insert(questions).values({
    userId: user.id,
    courseId,
    lessonId: lessonId ?? null,
    content: trimmed,
  });

  const [course] = await db
    .select({ slug: courses.slug })
    .from(courses)
    .where(eq(courses.id, courseId))
    .limit(1);

  if (course) revalidatePath(`/cursos/${course.slug}`);
  return { success: true };
}

/** Responde a uma pergunta — aberto a qualquer usuário autenticado. */
export async function answerQuestion(questionId: string, content: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Entre na sua conta para responder." };

  const trimmed = content.trim();
  if (!trimmed) return { error: "Escreva sua resposta." };

  await db.insert(answers).values({
    questionId,
    userId: user.id,
    content: trimmed,
  });

  const [row] = await db
    .select({ slug: courses.slug })
    .from(questions)
    .innerJoin(courses, eq(courses.id, questions.courseId))
    .where(eq(questions.id, questionId))
    .limit(1);

  if (row) revalidatePath(`/cursos/${row.slug}`);
  return { success: true };
}

/** Remove a própria pergunta (admin pode remover qualquer uma). */
export async function deleteQuestion(questionId: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Não autenticado." };

  const [row] = await db
    .select({ userId: questions.userId, slug: courses.slug })
    .from(questions)
    .innerJoin(courses, eq(courses.id, questions.courseId))
    .where(eq(questions.id, questionId))
    .limit(1);

  if (!row) return { error: "Pergunta não encontrada." };
  if (row.userId !== user.id && user.role !== "admin") {
    return { error: "Você só pode remover suas próprias perguntas." };
  }

  await db.delete(questions).where(eq(questions.id, questionId));
  revalidatePath(`/cursos/${row.slug}`);
  return { success: true };
}

/** Remove a própria resposta (admin pode remover qualquer uma). */
export async function deleteAnswer(answerId: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Não autenticado." };

  const [row] = await db
    .select({ userId: answers.userId, slug: courses.slug })
    .from(answers)
    .innerJoin(questions, eq(questions.id, answers.questionId))
    .innerJoin(courses, eq(courses.id, questions.courseId))
    .where(eq(answers.id, answerId))
    .limit(1);

  if (!row) return { error: "Resposta não encontrada." };
  if (row.userId !== user.id && user.role !== "admin") {
    return { error: "Você só pode remover suas próprias respostas." };
  }

  await db.delete(answers).where(eq(answers.id, answerId));
  revalidatePath(`/cursos/${row.slug}`);
  return { success: true };
}
