"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Compass,
  MonitorPlay,
  LayoutGrid,
  Bookmark,
  History,
  Award,
  Download,
  Settings,
  HelpCircle,
  Crown,
  Shield,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const PRIMARY = [
  { href: "/inicio", label: "Início", icon: Home },
  { href: "/explorar", label: "Explorar", icon: Compass },
  { href: "/cursos", label: "Cursos", icon: MonitorPlay },
  { href: "/categorias", label: "Categorias", icon: LayoutGrid },
  { href: "/minha-lista", label: "Minha Lista", icon: Bookmark },
  { href: "/historico", label: "Histórico", icon: History },
  { href: "/certificados", label: "Certificados", icon: Award },
  { href: "/downloads", label: "Downloads", icon: Download },
];

const SECONDARY = [
  { href: "/configuracoes", label: "Configurações", icon: Settings },
  { href: "/ajuda", label: "Ajuda", icon: HelpCircle },
];

export function Sidebar({
  isPremium,
  isAdmin,
  onNavigate,
}: {
  isPremium: boolean;
  isAdmin: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <nav className="flex h-full flex-col gap-1 overflow-y-auto thin-scrollbar px-3 py-5">
      <ul className="space-y-0.5">
        {PRIMARY.map((item, i) => (
          <li key={item.href}>
            <SidebarLink
              {...item}
              active={isActive(item.href)}
              delay={i * 0.03}
              onNavigate={onNavigate}
            />
          </li>
        ))}
      </ul>

      <div className="my-4 h-px bg-white/[0.07]" />

      <ul className="space-y-0.5">
        {SECONDARY.map((item) => (
          <li key={item.href}>
            <SidebarLink
              {...item}
              active={isActive(item.href)}
              onNavigate={onNavigate}
            />
          </li>
        ))}
        {isAdmin && (
          <li>
            <SidebarLink
              href="/admin"
              label="Administração"
              icon={Shield}
              active={isActive("/admin")}
              onNavigate={onNavigate}
            />
          </li>
        )}
      </ul>

      {!isPremium && (
        <div className="mt-auto pt-6">
          <div className="border-gradient relative overflow-hidden rounded-xl bg-surface-1 p-5">
            <div className="pointer-events-none absolute -top-14 -right-14 h-32 w-32 rounded-full bg-brand/20 blur-3xl" />
            <Crown className="h-6 w-6 text-brand" />
            <h3 className="mt-3 font-display text-[0.95rem] font-semibold text-white">
              Seja Premium
            </h3>
            <p className="mt-1.5 text-[0.75rem] leading-relaxed text-neutral-500">
              Acesse todos os cursos, certificados e conteúdos exclusivos.
            </p>
            <Button
              asChild
              size="sm"
              shimmer
              className="mt-4 w-full"
              onClick={onNavigate}
            >
              <Link href="/premium">Assine agora</Link>
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
}

function SidebarLink({
  href,
  label,
  icon: Icon,
  active,
  delay = 0,
  onNavigate,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
  active: boolean;
  delay?: number;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      style={{ "--d": `${delay}s` } as React.CSSProperties}
      className={cn(
        "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-300",
        active
          ? "bg-brand/[0.12] font-medium text-white"
          : "text-neutral-400 hover:bg-white/[0.05] hover:text-white",
      )}
    >
      {/* Marcador vermelho da rota ativa */}
      <span
        className={cn(
          "absolute top-1/2 left-0 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-brand transition-all duration-300",
          active ? "opacity-100" : "scale-y-0 opacity-0",
        )}
      />
      <Icon
        className={cn(
          "h-[1.15rem] w-[1.15rem] shrink-0 transition-colors duration-300",
          active ? "text-brand" : "text-neutral-500 group-hover:text-neutral-300",
        )}
      />
      {label}
    </Link>
  );
}
