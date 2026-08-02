"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Logo } from "@/components/brand/logo";
import { SearchBar } from "./search-bar";
import { UserMenu } from "./user-menu";
import { Sidebar } from "./sidebar";
import type { SessionUser } from "@/lib/auth";

export function Topbar({ user }: { user: SessionUser }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

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
        <div className="flex h-full items-center gap-4 px-4 lg:px-6">
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
            <Logo />
          </Link>

          <SearchBar className="ml-auto w-full max-w-md" />

          <UserMenu user={user} />
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
