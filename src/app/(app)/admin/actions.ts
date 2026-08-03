"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq, sql } from "drizzle-orm";

import { db } from "@/db";
import {
  courses,
  materials,
  modules,
  lessons,
  categories,
  instructors,
  users,
} from "@/db/schema";
import { getCurrentUser, hashPassword } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import { fileTypeFromUrl } from "@/lib/uploads";

/** Toda action do admin passa por aqui antes de tocar o banco. */
async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    throw new Error("Acesso restrito a administradores.");
  }
  return user;
}

export type FormState = { error?: string; success?: string } | undefined;

/* --------------------------------- cursos --------------------------------- */

export async function upsertCourse(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();

  if (title.length < 3) return { error: "Informe um título válido." };

  const rawSlug = String(formData.get("slug") ?? "").trim();
  const slug = slugify(rawSlug || title);

  const learningPoints = String(formData.get("learningPoints") ?? "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const values = {
    title,
    slug,
    tagline: String(formData.get("tagline") ?? "").trim() || null,
    description: String(formData.get("description") ?? "").trim() || null,
    thumbnailUrl: String(formData.get("thumbnailUrl") ?? "").trim() || null,
    backdropUrl: String(formData.get("backdropUrl") ?? "").trim() || null,
    categoryId: String(formData.get("categoryId") ?? "") || null,
    instructorId: String(formData.get("instructorId") ?? "") || null,
    level: String(formData.get("level") ?? "Iniciante"),
    language: String(formData.get("language") ?? "Português"),
    isPremium: formData.get("isPremium") === "on",
    isNew: formData.get("isNew") === "on",
    isPublished: formData.get("isPublished") === "on",
    learningPoints,
    // resourceCount é derivado dos materiais cadastrados, não editado à mão.
    updatedLabel: String(formData.get("updatedLabel") ?? "").trim() || null,
  };

  try {
    if (id) {
      await db.update(courses).set(values).where(eq(courses.id, id));
    } else {
      const [created] = await db
        .insert(courses)
        .values(values)
        .returning({ id: courses.id });
      revalidatePath("/admin/cursos");
      redirect(`/admin/cursos/${created.id}`);
    }
  } catch (err) {
    // redirect() lança internamente — não deve virar erro de formulário.
    if (err instanceof Error && err.message.includes("NEXT_REDIRECT")) throw err;
    return { error: "Não foi possível salvar. O slug já pode estar em uso." };
  }

  revalidatePath("/admin/cursos");
  revalidatePath(`/cursos/${slug}`);
  revalidatePath("/inicio");
  return { success: "Curso salvo com sucesso." };
}

export async function deleteCourse(courseId: string) {
  await requireAdmin();
  await db.delete(courses).where(eq(courses.id, courseId));
  revalidatePath("/admin/cursos");
  revalidatePath("/inicio");
}

/** Recalcula a duração total do curso a partir das aulas. */
async function syncCourseDuration(courseId: string) {
  await db
    .update(courses)
    .set({
      totalDuration: sql`(
        select coalesce(sum(${lessons.duration}), 0)::int
        from ${lessons} where ${lessons.courseId} = ${courseId}
      )`,
    })
    .where(eq(courses.id, courseId));
}

/* -------------------------------- módulos --------------------------------- */

export async function createModule(courseId: string, title: string) {
  await requireAdmin();
  if (!title.trim()) return;

  const [{ next }] = await db
    .select({ next: sql<number>`coalesce(max(${modules.sortOrder}) + 1, 0)::int` })
    .from(modules)
    .where(eq(modules.courseId, courseId));

  await db
    .insert(modules)
    .values({ courseId, title: title.trim(), sortOrder: next });

  revalidatePath(`/admin/cursos/${courseId}`);
}

export async function updateModule(moduleId: string, title: string) {
  await requireAdmin();
  await db
    .update(modules)
    .set({ title: title.trim() })
    .where(eq(modules.id, moduleId));

  const [row] = await db
    .select({ courseId: modules.courseId })
    .from(modules)
    .where(eq(modules.id, moduleId))
    .limit(1);

  if (row) revalidatePath(`/admin/cursos/${row.courseId}`);
}

export async function deleteModule(moduleId: string, courseId: string) {
  await requireAdmin();
  await db.delete(modules).where(eq(modules.id, moduleId));
  await syncCourseDuration(courseId);
  revalidatePath(`/admin/cursos/${courseId}`);
}

/* --------------------------------- aulas ---------------------------------- */

export async function createLesson(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();

  const courseId = String(formData.get("courseId") ?? "");
  const moduleId = String(formData.get("moduleId") ?? "");
  const title = String(formData.get("title") ?? "").trim();

  if (!courseId || !moduleId) return { error: "Selecione um módulo." };
  if (title.length < 2) return { error: "Informe o título da aula." };

  const [{ next }] = await db
    .select({ next: sql<number>`coalesce(max(${lessons.sortOrder}) + 1, 0)::int` })
    .from(lessons)
    .where(eq(lessons.courseId, courseId));

  const minutes = Number(formData.get("durationMinutes") ?? 0);

  try {
    await db.insert(lessons).values({
      courseId,
      moduleId,
      title,
      slug: `${next + 1}-${slugify(title)}`,
      description: String(formData.get("description") ?? "").trim() || null,
      videoUrl: String(formData.get("videoUrl") ?? "").trim() || null,
      thumbnailUrl: String(formData.get("thumbnailUrl") ?? "").trim() || null,
      duration: Math.round(minutes * 60),
      isFree: formData.get("isFree") === "on",
      sortOrder: next,
    });
  } catch {
    return { error: "Não foi possível criar a aula." };
  }

  await syncCourseDuration(courseId);
  revalidatePath(`/admin/cursos/${courseId}`);
  return { success: "Aula criada." };
}

export async function updateLesson(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const courseId = String(formData.get("courseId") ?? "");
  const title = String(formData.get("title") ?? "").trim();

  if (!id || title.length < 2) return { error: "Informe o título da aula." };

  const minutes = Number(formData.get("durationMinutes") ?? 0);

  await db
    .update(lessons)
    .set({
      title,
      description: String(formData.get("description") ?? "").trim() || null,
      videoUrl: String(formData.get("videoUrl") ?? "").trim() || null,
      thumbnailUrl: String(formData.get("thumbnailUrl") ?? "").trim() || null,
      duration: Math.round(minutes * 60),
      isFree: formData.get("isFree") === "on",
    })
    .where(eq(lessons.id, id));

  await syncCourseDuration(courseId);
  revalidatePath(`/admin/cursos/${courseId}`);
  return { success: "Aula atualizada." };
}

export async function deleteLesson(lessonId: string, courseId: string) {
  await requireAdmin();
  await db.delete(lessons).where(eq(lessons.id, lessonId));
  await syncCourseDuration(courseId);
  revalidatePath(`/admin/cursos/${courseId}`);
}

/* ------------------------------- categorias ------------------------------- */

export async function createCategory(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();
  if (name.length < 2) return { error: "Informe o nome da categoria." };

  try {
    await db.insert(categories).values({
      name,
      slug: slugify(name),
      icon: String(formData.get("icon") ?? "shapes").trim() || "shapes",
      color: String(formData.get("color") ?? "#E50914"),
    });
  } catch {
    return { error: "Já existe uma categoria com esse nome." };
  }

  revalidatePath("/admin/categorias");
  return { success: "Categoria criada." };
}

export async function deleteCategory(categoryId: string) {
  await requireAdmin();
  await db.delete(categories).where(eq(categories.id, categoryId));
  revalidatePath("/admin/categorias");
}

/* ------------------------------- instrutores ------------------------------ */

export async function createInstructor(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();
  if (name.length < 2) return { error: "Informe o nome do instrutor." };

  await db.insert(instructors).values({
    name,
    title: String(formData.get("title") ?? "").trim() || "Instrutor",
    bio: String(formData.get("bio") ?? "").trim() || null,
    avatarUrl: String(formData.get("avatarUrl") ?? "").trim() || null,
  });

  revalidatePath("/admin/instrutores");
  return { success: "Instrutor criado." };
}

export async function updateInstructor(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  if (!id) return { error: "Instrutor inválido." };
  if (name.length < 2) return { error: "Informe o nome do instrutor." };

  await db
    .update(instructors)
    .set({
      name,
      title: String(formData.get("title") ?? "").trim() || "Instrutor",
      bio: String(formData.get("bio") ?? "").trim() || null,
      avatarUrl: String(formData.get("avatarUrl") ?? "").trim() || null,
    })
    .where(eq(instructors.id, id));

  revalidatePath("/admin/instrutores");
  revalidatePath("/explorar");
  revalidatePath("/cursos");
  return { success: "Instrutor atualizado." };
}

export async function deleteInstructor(instructorId: string) {
  await requireAdmin();
  await db.delete(instructors).where(eq(instructors.id, instructorId));
  revalidatePath("/admin/instrutores");
}

/* -------------------------------- usuários -------------------------------- */

export async function createUser(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (name.length < 2) return { error: "Informe o nome." };
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))
    return { error: "E-mail inválido." };
  if (password.length < 6)
    return { error: "A senha precisa ter ao menos 6 caracteres." };

  try {
    await db.insert(users).values({
      name,
      email,
      passwordHash: await hashPassword(password),
      role: formData.get("role") === "admin" ? "admin" : "student",
      isPremium: formData.get("isPremium") === "on",
    });
  } catch {
    return { error: "Já existe um usuário com este e-mail." };
  }

  revalidatePath("/admin/usuarios");
  return { success: "Usuário criado." };
}

export async function updateUserFlags(
  userId: string,
  updates: { role?: "student" | "admin"; isPremium?: boolean },
) {
  await requireAdmin();
  await db.update(users).set(updates).where(eq(users.id, userId));
  revalidatePath("/admin/usuarios");
}

export async function deleteUser(userId: string) {
  const admin = await requireAdmin();
  // Um admin não pode remover a própria conta e se trancar para fora.
  if (admin.id === userId) return;

  await db.delete(users).where(eq(users.id, userId));
  revalidatePath("/admin/usuarios");
}

/* -------------------------------- materiais -------------------------------- */

/** Mantém `resourceCount` fiel à quantidade real de materiais do curso. */
async function syncCourseResourceCount(courseId: string) {
  await db
    .update(courses)
    .set({
      resourceCount: sql`(
        select count(*)::int
        from ${materials} where ${materials.courseId} = ${courseId}
      )`,
    })
    .where(eq(courses.id, courseId));
}

/** Revalida o admin e as telas do aluno que listam materiais. */
async function revalidateMaterialPaths(courseId: string) {
  revalidatePath(`/admin/cursos/${courseId}`);

  const [course] = await db
    .select({ slug: courses.slug })
    .from(courses)
    .where(eq(courses.id, courseId))
    .limit(1);

  if (course) {
    revalidatePath(`/cursos/${course.slug}`);
    revalidatePath(`/assistir/${course.slug}`, "layout");
  }
}

/** Lê e valida os campos comuns de criação/edição de material. */
function readMaterialForm(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const fileUrl = String(formData.get("fileUrl") ?? "").trim();
  const isLink = String(formData.get("isLink") ?? "") === "on";
  const rawLesson = String(formData.get("lessonId") ?? "");

  if (title.length < 2) return { error: "Informe o título do material." } as const;
  if (!fileUrl) {
    return {
      error: isLink ? "Informe o endereço do link." : "Envie um arquivo.",
    } as const;
  }
  if (isLink && !/^https?:\/\//i.test(fileUrl)) {
    return { error: "O link deve começar com http:// ou https://." } as const;
  }

  const sizeLabel = String(formData.get("sizeLabel") ?? "").trim();

  return {
    values: {
      title,
      fileUrl,
      fileType: isLink ? "link" : fileTypeFromUrl(fileUrl),
      sizeLabel: isLink || !sizeLabel ? null : sizeLabel,
      lessonId: rawLesson || null,
    },
  } as const;
}

export async function createMaterial(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();

  const courseId = String(formData.get("courseId") ?? "");
  if (!courseId) return { error: "Curso inválido." };

  const parsed = readMaterialForm(formData);
  if ("error" in parsed) return { error: parsed.error };

  const [{ next }] = await db
    .select({
      next: sql<number>`coalesce(max(${materials.sortOrder}) + 1, 0)::int`,
    })
    .from(materials)
    .where(eq(materials.courseId, courseId));

  try {
    await db
      .insert(materials)
      .values({ courseId, ...parsed.values, sortOrder: next });
  } catch {
    return { error: "Não foi possível adicionar o material." };
  }

  await syncCourseResourceCount(courseId);
  await revalidateMaterialPaths(courseId);
  return { success: "Material adicionado." };
}

export async function updateMaterial(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const courseId = String(formData.get("courseId") ?? "");
  if (!id || !courseId) return { error: "Material inválido." };

  const parsed = readMaterialForm(formData);
  if ("error" in parsed) return { error: parsed.error };

  try {
    await db.update(materials).set(parsed.values).where(eq(materials.id, id));
  } catch {
    return { error: "Não foi possível salvar o material." };
  }

  await revalidateMaterialPaths(courseId);
  return { success: "Material atualizado." };
}

export async function deleteMaterial(materialId: string, courseId: string) {
  await requireAdmin();
  await db.delete(materials).where(eq(materials.id, materialId));
  await syncCourseResourceCount(courseId);
  await revalidateMaterialPaths(courseId);
}
