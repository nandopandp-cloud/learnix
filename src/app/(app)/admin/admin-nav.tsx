"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield } from "lucide-react";

import { cn } from "@/lib/utils";

const TABS = [
  { href: "/admin", label: "Visão geral", exact: true },
  { href: "/admin/cursos", label: "Cursos" },
  { href: "/admin/categorias", label: "Categorias" },
  { href: "/admin/instrutores", label: "Instrutores" },
  { href: "/admin/usuarios", label: "Usuários" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <div className="border-b border-white/[0.07] px-4 pt-6 lg:px-8">
      <div className="flex items-center gap-2 text-brand">
        <Shield className="h-4 w-4" />
        <span className="font-mono text-[0.66rem] tracking-[0.26em] uppercase">
          Administração
        </span>
      </div>

      <nav className="hide-scrollbar mt-4 flex gap-1 overflow-x-auto">
        {TABS.map((tab) => {
          const active = tab.exact
            ? pathname === tab.href
            : pathname.startsWith(tab.href);

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "relative shrink-0 px-4 py-3 text-[0.88rem] transition-colors duration-300",
                active
                  ? "font-medium text-white"
                  : "text-neutral-500 hover:text-neutral-300",
              )}
            >
              {tab.label}
              <span
                className={cn(
                  "absolute right-3 -bottom-px left-3 h-[2px] rounded-full bg-brand transition-all duration-300",
                  active ? "opacity-100" : "scale-x-0 opacity-0",
                )}
              />
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
