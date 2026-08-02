"use client";

import { cn } from "@/lib/utils";
import { Sidebar } from "@/components/app/sidebar";
import { useSidebar } from "@/components/app/sidebar-context";
import type { SessionUser } from "@/lib/auth";

export function AppShell({
  user,
  children,
}: {
  user: SessionUser;
  children: React.ReactNode;
}) {
  const { collapsed } = useSidebar();

  return (
    <div className="flex">
      <aside
        className={cn(
          "sticky top-[var(--topbar-h)] hidden h-[calc(100dvh-var(--topbar-h))] shrink-0 border-r border-white/[0.07] transition-[width] duration-300 ease-[var(--ease-out-quint)] lg:block",
          collapsed ? "w-[4.5rem]" : "w-[15.5rem]",
        )}
      >
        <Sidebar
          isPremium={user.isPremium}
          isAdmin={user.role === "admin"}
          collapsed={collapsed}
        />
      </aside>

      <main className="min-w-0 flex-1 pb-20">{children}</main>
    </div>
  );
}
