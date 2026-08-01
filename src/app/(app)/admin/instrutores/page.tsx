import type { Metadata } from "next";
import { sql } from "drizzle-orm";

import { db } from "@/db";
import { instructors, courses } from "@/db/schema";
import { PageHeader } from "@/components/app/page-header";
import { InstructorManager } from "./instructor-manager";

export const metadata: Metadata = { title: "Instrutores · Admin" };

export default async function AdminInstructorsPage() {
  const rows = await db
    .select({
      id: instructors.id,
      name: instructors.name,
      title: instructors.title,
      bio: instructors.bio,
      avatarUrl: instructors.avatarUrl,
      courseCount: sql<number>`(
        select count(*)::int from ${courses} where ${courses.instructorId} = ${instructors.id}
      )`,
    })
    .from(instructors)
    .orderBy(instructors.name);

  return (
    <div>
      <PageHeader
        title="Instrutores"
        description="Quem assina os cursos da plataforma."
      />
      <div className="max-w-3xl px-4 pb-10 lg:px-8">
        <InstructorManager instructors={rows} />
      </div>
    </div>
  );
}
