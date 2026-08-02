"use client";

import { createContext, useContext, useState } from "react";
import { usePathname } from "next/navigation";

/** Rotas onde o conteúdo pede mais espaço horizontal: curso e player. */
const AUTO_COLLAPSE_PREFIXES = ["/cursos/", "/assistir/"];

type SidebarContextValue = {
  collapsed: boolean;
  toggle: () => void;
};

const SidebarContext = createContext<SidebarContextValue | null>(null);

/**
 * Estado de colapso da sidebar, compartilhado entre o botão no header
 * (ao lado da logo) e o próprio painel — os dois precisam do mesmo
 * estado para agir como um único controle.
 */
export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const shouldAutoCollapse = AUTO_COLLAPSE_PREFIXES.some((p) =>
    pathname.startsWith(p),
  );

  return (
    <SidebarStateHost key={shouldAutoCollapse ? "compact" : "full"} initialCollapsed={shouldAutoCollapse}>
      {children}
    </SidebarStateHost>
  );
}

function SidebarStateHost({
  initialCollapsed,
  children,
}: {
  initialCollapsed: boolean;
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(initialCollapsed);

  return (
    <SidebarContext.Provider
      value={{ collapsed, toggle: () => setCollapsed((c) => !c) }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error("useSidebar deve ser usado dentro de SidebarProvider");
  return ctx;
}
