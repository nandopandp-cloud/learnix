"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import {
  enrollments,
  lessonProgress,
  lessons,
  notes,
  users,
  watchlist,
} from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";

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
