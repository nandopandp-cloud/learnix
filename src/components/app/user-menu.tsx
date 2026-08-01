"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronDown,
  Settings,
  Award,
  Bookmark,
  LogOut,
  Crown,
  Shield,
} from "lucide-react";

import { cn, initials } from "@/lib/utils";
import { logoutAction } from "@/app/(auth)/actions";
import type { SessionUser } from "@/lib/auth";

export function UserMenu({ user }: { user: SessionUser }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Menu do usuário"
        aria-expanded={open}
        className="flex items-center gap-1.5 rounded-full p-0.5 transition hover:bg-white/5"
      >
        <span className="relative block h-9 w-9 overflow-hidden rounded-full bg-surface-2 ring-1 ring-white/15">
          {user.avatarUrl ? (
            <Image
              src={user.avatarUrl}
              alt={user.name}
              fill
              sizes="36px"
              className="object-cover"
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-xs font-semibold text-white">
              {initials(user.name)}
            </span>
          )}
        </span>
        <ChevronDown
          className={cn(
            "hidden h-3.5 w-3.5 text-neutral-500 transition-transform duration-300 sm:block",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div
          className="glass absolute top-full right-0 z-50 mt-2 w-64 overflow-hidden rounded-xl ring-1 ring-white/10 shadow-2xl"
          style={{ animation: "animationIn 0.3s var(--ease-out-expo) both" }}
        >
          <div className="border-b border-white/[0.07] px-4 py-3.5">
            <p className="truncate text-sm font-medium text-white">
              {user.name}
            </p>
            <p className="truncate text-[0.75rem] text-neutral-500">
              {user.email}
            </p>
            {user.isPremium && (
              <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-brand/15 px-2 py-0.5 text-[0.65rem] font-medium text-brand-bright ring-1 ring-brand/25">
                <Crown className="h-3 w-3" />
                Premium
              </span>
            )}
          </div>

          <div className="py-1.5">
            {user.role === "admin" && (
              <MenuLink href="/admin" icon={Shield} label="Administração" />
            )}
            <MenuLink href="/minha-lista" icon={Bookmark} label="Minha lista" />
            <MenuLink href="/certificados" icon={Award} label="Certificados" />
            <MenuLink
              href="/configuracoes"
              icon={Settings}
              label="Configurações"
            />
          </div>

          <form action={logoutAction} className="border-t border-white/[0.07] p-1.5">
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-neutral-400 transition hover:bg-brand/10 hover:text-brand-bright"
            >
              <LogOut className="h-4 w-4" />
              Sair da conta
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

function MenuLink({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-400 transition hover:bg-white/[0.05] hover:text-white"
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
}
