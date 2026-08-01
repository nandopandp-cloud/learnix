import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";
import { Topbar } from "@/components/app/topbar";
import { Sidebar } from "@/components/app/sidebar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/entrar");

  return (
    <div className="min-h-dvh bg-void">
      <Topbar user={user} />

      <div className="flex">
        {/* Sidebar fixa — some abaixo de lg, onde vira drawer na topbar. */}
        <aside className="sticky top-[var(--topbar-h)] hidden h-[calc(100dvh-var(--topbar-h))] w-[15.5rem] shrink-0 border-r border-white/[0.07] lg:block">
          <Sidebar isPremium={user.isPremium} isAdmin={user.role === "admin"} />
        </aside>

        <main className="min-w-0 flex-1 pb-20">{children}</main>
      </div>
    </div>
  );
}
