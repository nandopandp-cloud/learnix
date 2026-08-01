"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import { PanelLeftOpen, PanelLeftClose } from "lucide-react";

import { cn } from "@/lib/utils";
import { Sidebar } from "@/components/app/sidebar";
import type { SessionUser } from "@/lib/auth";

/** Rotas onde o conteúdo pede mais espaço horizontal: curso e player. */
const AUTO_COLLAPSE_PREFIXES = ["/cursos/", "/assistir/"];

export function AppShell({
  user,
  children,
}: {
  user: SessionUser;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const shouldAutoCollapse = AUTO_COLLAPSE_PREFIXES.some((p) =>
    pathname.startsWith(p),
  );

  return (
    <div className="flex">
      {/*
        A key derivada da rota remonta o painel ao entrar/sair de curso e
        player — assim o override manual do usuário nunca "vaza" de uma tela
        para outra, sem precisar sincronizar estado via efeito.
      */}
      <CollapsiblePanel
        key={shouldAutoCollapse ? "compact" : "full"}
        user={user}
        initialCollapsed={shouldAutoCollapse}
      />

      <main className="min-w-0 flex-1 pb-20">{children}</main>
    </div>
  );
}

function CollapsiblePanel({
  user,
  initialCollapsed,
}: {
  user: SessionUser;
  initialCollapsed: boolean;
}) {
  const [collapsed, setCollapsed] = useState(initialCollapsed);

  return (
    <aside
      className={cn(
        "sticky top-[var(--topbar-h)] hidden h-[calc(100dvh-var(--topbar-h))] shrink-0 border-r border-white/[0.07] transition-[width] duration-300 ease-[var(--ease-out-quint)] lg:flex lg:flex-col",
        collapsed ? "w-[4.5rem]" : "w-[15.5rem]",
      )}
    >
      <div
        className={cn(
          "flex shrink-0 items-center border-b border-white/[0.07] py-2",
          collapsed ? "justify-center px-2" : "justify-end px-3",
        )}
      >
        <button
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
          title={collapsed ? "Expandir menu" : "Recolher menu"}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-500 transition hover:bg-white/[0.06] hover:text-white"
        >
          {collapsed ? (
            <PanelLeftOpen className="h-4 w-4" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
        </button>
      </div>

      <div className="min-h-0 flex-1">
        <Sidebar
          isPremium={user.isPremium}
          isAdmin={user.role === "admin"}
          collapsed={collapsed}
        />
      </div>
    </aside>
  );
}
