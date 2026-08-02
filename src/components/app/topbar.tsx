"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X, PanelLeftClose, PanelLeftOpen } from "lucide-react";

import { cn } from "@/lib/utils";
import { Logo, LogoMark } from "@/components/brand/logo";
import { SearchBar } from "./search-bar";
import { UserMenu } from "./user-menu";
import { Sidebar } from "./sidebar";
import { useSidebar } from "./sidebar-context";
import type { SessionUser } from "@/lib/auth";

export function Topbar({ user }: { user: SessionUser }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { collapsed, toggle } = useSidebar();

  /* A topbar ganha fundo sólido assim que a página sai do topo. */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 h-[var(--topbar-h)] transition-all duration-500",
          scrolled
            ? "glass-strong border-b border-white/[0.07]"
            : "border-b border-transparent bg-gradient-to-b from-void via-void/80 to-transparent",
        )}
      >
        <div className="grid h-full grid-cols-[1fr_auto_1fr] items-center gap-4 px-4 lg:px-6">
          {/* Esquerda: menu mobile, toggle da sidebar e logo, tratados como um único bloco. */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setMobileOpen(true)}
              aria-label="Abrir menu"
              className="rounded-lg p-2 text-neutral-400 transition hover:bg-white/5 hover:text-white lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>

            <Link
              href="/inicio"
              onClick={() => setMobileOpen(false)}
              className="shrink-0"
            >
              {/* Em telas grandes, a marca acompanha o colapso da sidebar; no mobile é sempre a logo completa. */}
              <span className={collapsed ? "hidden lg:block" : "hidden"}>
                <LogoMark />
              </span>
              <span className={collapsed ? "lg:hidden" : "block"}>
                <Logo />
              </span>
            </Link>

            <button
              onClick={toggle}
              aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
              title={collapsed ? "Expandir menu" : "Recolher menu"}
              className="hidden shrink-0 rounded-lg p-2 text-neutral-400 transition hover:bg-white/5 hover:text-white lg:flex lg:items-center lg:justify-center"
            >
              {collapsed ? (
                <PanelLeftOpen className="h-[1.15rem] w-[1.15rem]" />
              ) : (
                <PanelLeftClose className="h-[1.15rem] w-[1.15rem]" />
              )}
            </button>
          </div>

          {/* Centro: busca, centralizada de verdade no header. */}
          <SearchBar className="w-[26rem] max-w-full" />

          {/* Direita: avatar, alinhado à borda. */}
          <div className="flex items-center justify-end">
            <UserMenu user={user} />
          </div>
        </div>
      </header>

      {/* Drawer mobile */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <button
            aria-label="Fechar menu"
            onClick={() => setMobileOpen(false)}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            style={{ animation: "fadeIn 0.25s ease-out both" }}
          />
          <div
            className="glass-strong absolute inset-y-0 left-0 w-[17rem] border-r border-white/[0.07]"
            style={{
              animation:
                "animationIn 0.4s var(--ease-out-expo) both",
            }}
          >
            <div className="flex h-[var(--topbar-h)] items-center justify-between px-4">
              <Logo />
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Fechar menu"
                className="rounded-lg p-2 text-neutral-400 transition hover:bg-white/5 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="h-[calc(100dvh-var(--topbar-h))]">
              <Sidebar
                isPremium={user.isPremium}
                isAdmin={user.role === "admin"}
                onNavigate={() => setMobileOpen(false)}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
