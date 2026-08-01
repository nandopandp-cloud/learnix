import type { Metadata } from "next";
import { sql } from "drizzle-orm";

import { db } from "@/db";
import { categories, courses } from "@/db/schema";
import { PageHeader } from "@/components/app/page-header";
import { CategoryManager } from "./category-manager";

export const metadata: Metadata = { title: "Categorias · Admin" };

export default async function AdminCategoriesPage() {
  const rows = await db
    .select({
      id: categories.id,
      name: categories.name,
      slug: categories.slug,
      icon: categories.icon,
      color: categories.color,
      courseCount: sql<number>`(
        select count(*)::int from ${courses} where ${courses.categoryId} = ${categories.id}
      )`,
    })
    .from(categories)
    .orderBy(categories.sortOrder);

  return (
    <div>
      <PageHeader
        title="Categorias"
        description="Organize o catálogo em temas."
      />
      <div className="max-w-3xl px-4 pb-10 lg:px-8">
        <CategoryManager categories={rows} />
      </div>
    </div>
  );
}
