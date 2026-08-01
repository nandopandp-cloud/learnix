import type { Metadata } from "next";
import { desc, sql } from "drizzle-orm";

import { db } from "@/db";
import { users, enrollments } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { PageHeader } from "@/components/app/page-header";
import { UserManager } from "./user-manager";

export const metadata: Metadata = { title: "Usuários · Admin" };

export default async function AdminUsersPage() {
  const current = (await getCurrentUser())!;

  const rows = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      avatarUrl: users.avatarUrl,
      role: users.role,
      isPremium: users.isPremium,
      createdAt: users.createdAt,
      enrollmentCount: sql<number>`(
        select count(*)::int from ${enrollments} where ${enrollments.userId} = ${users.id}
      )`,
    })
    .from(users)
    .orderBy(desc(users.createdAt));

  return (
    <div>
      <PageHeader
        title="Usuários"
        description={`${rows.length} contas cadastradas na plataforma.`}
      />
      <div className="max-w-4xl px-4 pb-10 lg:px-8">
        <UserManager users={rows} currentUserId={current.id} />
      </div>
    </div>
  );
}
