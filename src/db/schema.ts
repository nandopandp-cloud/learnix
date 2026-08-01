import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  uuid,
  real,
  unique,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

/* ---------------------------------- users --------------------------------- */

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  avatarUrl: text("avatar_url"),
  role: text("role", { enum: ["student", "admin"] })
    .notNull()
    .default("student"),
  isPremium: boolean("is_premium").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const sessions = pgTable(
  "sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    token: text("token").notNull().unique(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("sessions_user_idx").on(t.userId)],
);

/* -------------------------------- instrutores ------------------------------ */

export const instructors = pgTable("instructors", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  title: text("title").notNull(),
  bio: text("bio"),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/* -------------------------------- categorias ------------------------------- */

export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  /** nome do ícone lucide, ex.: "code-xml" */
  icon: text("icon").notNull().default("shapes"),
  /** cor de acento usada nos chips, ex.: "#E50914" */
  color: text("color").notNull().default("#E50914"),
  sortOrder: integer("sort_order").notNull().default(0),
});

/* ---------------------------------- cursos --------------------------------- */

export const courses = pgTable(
  "courses",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    slug: text("slug").notNull().unique(),
    tagline: text("tagline"),
    description: text("description"),
    thumbnailUrl: text("thumbnail_url"),
    /** imagem larga usada no hero da página do curso */
    backdropUrl: text("backdrop_url"),
    categoryId: uuid("category_id").references(() => categories.id, {
      onDelete: "set null",
    }),
    instructorId: uuid("instructor_id").references(() => instructors.id, {
      onDelete: "set null",
    }),
    level: text("level").notNull().default("Iniciante"),
    language: text("language").notNull().default("Português"),
    rating: real("rating").notNull().default(0),
    ratingCount: integer("rating_count").notNull().default(0),
    /** duração total em segundos, derivada das aulas no seed/admin */
    totalDuration: integer("total_duration").notNull().default(0),
    isPremium: boolean("is_premium").notNull().default(false),
    isNew: boolean("is_new").notNull().default(false),
    isPublished: boolean("is_published").notNull().default(true),
    /** bullets de "Você vai aprender" */
    learningPoints: text("learning_points").array().notNull().default([]),
    resourceCount: integer("resource_count").notNull().default(0),
    hasCertificate: boolean("has_certificate").notNull().default(true),
    updatedLabel: text("updated_label"),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("courses_category_idx").on(t.categoryId),
    index("courses_instructor_idx").on(t.instructorId),
  ],
);

/* --------------------------------- módulos --------------------------------- */

export const modules = pgTable(
  "modules",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    courseId: uuid("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => [index("modules_course_idx").on(t.courseId)],
);

/* ---------------------------------- aulas ---------------------------------- */

export const lessons = pgTable(
  "lessons",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    moduleId: uuid("module_id")
      .notNull()
      .references(() => modules.id, { onDelete: "cascade" }),
    courseId: uuid("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    videoUrl: text("video_url"),
    thumbnailUrl: text("thumbnail_url"),
    /** duração em segundos */
    duration: integer("duration").notNull().default(0),
    /** aulas gratuitas ficam liberadas mesmo sem premium */
    isFree: boolean("is_free").notNull().default(false),
    /** bullets de "O que você vai aprender" na aba da aula */
    learningPoints: text("learning_points").array().notNull().default([]),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => [
    index("lessons_course_idx").on(t.courseId),
    index("lessons_module_idx").on(t.moduleId),
    unique("lessons_course_slug_unq").on(t.courseId, t.slug),
  ],
);

/* -------------------------------- materiais -------------------------------- */

export const materials = pgTable(
  "materials",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    courseId: uuid("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),
    lessonId: uuid("lesson_id").references(() => lessons.id, {
      onDelete: "cascade",
    }),
    title: text("title").notNull(),
    fileUrl: text("file_url").notNull(),
    fileType: text("file_type").notNull().default("pdf"),
    sizeLabel: text("size_label"),
  },
  (t) => [index("materials_course_idx").on(t.courseId)],
);

/* -------------------------------- matrículas ------------------------------- */

export const enrollments = pgTable(
  "enrollments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    courseId: uuid("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    lastAccessedAt: timestamp("last_accessed_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [unique("enrollments_user_course_unq").on(t.userId, t.courseId)],
);

/* -------------------------- progresso por aula ----------------------------- */

export const lessonProgress = pgTable(
  "lesson_progress",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    lessonId: uuid("lesson_id")
      .notNull()
      .references(() => lessons.id, { onDelete: "cascade" }),
    courseId: uuid("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),
    /** último ponto assistido, em segundos */
    positionSeconds: integer("position_seconds").notNull().default(0),
    completed: boolean("completed").notNull().default(false),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    unique("lesson_progress_user_lesson_unq").on(t.userId, t.lessonId),
    index("lesson_progress_user_course_idx").on(t.userId, t.courseId),
  ],
);

/* ------------------------------- minha lista ------------------------------- */

export const watchlist = pgTable(
  "watchlist",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    courseId: uuid("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [unique("watchlist_user_course_unq").on(t.userId, t.courseId)],
);

/* -------------------------------- anotações -------------------------------- */

export const notes = pgTable(
  "notes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    lessonId: uuid("lesson_id")
      .notNull()
      .references(() => lessons.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    /** momento do vídeo a que a nota se refere, em segundos */
    timestampSeconds: integer("timestamp_seconds").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("notes_user_lesson_idx").on(t.userId, t.lessonId)],
);

/* -------------------------------- relations -------------------------------- */

export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  enrollments: many(enrollments),
  progress: many(lessonProgress),
  watchlist: many(watchlist),
  notes: many(notes),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  courses: many(courses),
}));

export const instructorsRelations = relations(instructors, ({ many }) => ({
  courses: many(courses),
}));

export const coursesRelations = relations(courses, ({ one, many }) => ({
  category: one(categories, {
    fields: [courses.categoryId],
    references: [categories.id],
  }),
  instructor: one(instructors, {
    fields: [courses.instructorId],
    references: [instructors.id],
  }),
  modules: many(modules),
  lessons: many(lessons),
  materials: many(materials),
  enrollments: many(enrollments),
}));

export const modulesRelations = relations(modules, ({ one, many }) => ({
  course: one(courses, { fields: [modules.courseId], references: [courses.id] }),
  lessons: many(lessons),
}));

export const lessonsRelations = relations(lessons, ({ one, many }) => ({
  module: one(modules, { fields: [lessons.moduleId], references: [modules.id] }),
  course: one(courses, { fields: [lessons.courseId], references: [courses.id] }),
  materials: many(materials),
  progress: many(lessonProgress),
  notes: many(notes),
}));

export const materialsRelations = relations(materials, ({ one }) => ({
  course: one(courses, {
    fields: [materials.courseId],
    references: [courses.id],
  }),
  lesson: one(lessons, {
    fields: [materials.lessonId],
    references: [lessons.id],
  }),
}));

export const enrollmentsRelations = relations(enrollments, ({ one }) => ({
  user: one(users, { fields: [enrollments.userId], references: [users.id] }),
  course: one(courses, {
    fields: [enrollments.courseId],
    references: [courses.id],
  }),
}));

export const lessonProgressRelations = relations(lessonProgress, ({ one }) => ({
  user: one(users, { fields: [lessonProgress.userId], references: [users.id] }),
  lesson: one(lessons, {
    fields: [lessonProgress.lessonId],
    references: [lessons.id],
  }),
  course: one(courses, {
    fields: [lessonProgress.courseId],
    references: [courses.id],
  }),
}));

export const watchlistRelations = relations(watchlist, ({ one }) => ({
  user: one(users, { fields: [watchlist.userId], references: [users.id] }),
  course: one(courses, {
    fields: [watchlist.courseId],
    references: [courses.id],
  }),
}));

export const notesRelations = relations(notes, ({ one }) => ({
  user: one(users, { fields: [notes.userId], references: [users.id] }),
  lesson: one(lessons, { fields: [notes.lessonId], references: [lessons.id] }),
}));

export type User = typeof users.$inferSelect;
export type Course = typeof courses.$inferSelect;
export type Lesson = typeof lessons.$inferSelect;
export type Module = typeof modules.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Instructor = typeof instructors.$inferSelect;
