"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";
import type { Category } from "@/db/schema";

const LEVELS = [
  "Iniciante",
  "Intermediário",
  "Iniciante ao Avançado",
] as const;

export function ExploreFilters({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const categoria = params.get("categoria");
  const nivel = params.get("nivel");
  const q = params.get("q");
  const hasFilters = Boolean(categoria || nivel || q);

  /** Alterna um filtro: clicar no valor ativo o remove. */
  const setFilter = (key: string, value: string | null) => {
    const next = new URLSearchParams(params.toString());
    if (value === null || next.get(key) === value) {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    router.push(`${pathname}?${next.toString()}`);
  };

  return (
    <div className="space-y-3">
      <div className="hide-scrollbar flex gap-2 overflow-x-auto pb-1">
        <Chip
          active={!categoria}
          onClick={() => setFilter("categoria", null)}
          label="Todas"
        />
        {categories.map((cat) => (
          <Chip
            key={cat.id}
            active={categoria === cat.slug}
            onClick={() => setFilter("categoria", cat.slug)}
            label={cat.name}
            color={cat.color}
          />
        ))}
      </div>

      <div className="hide-scrollbar flex items-center gap-2 overflow-x-auto pb-1">
        <span className="shrink-0 text-[0.75rem] text-neutral-600">Nível:</span>
        {LEVELS.map((level) => (
          <Chip
            key={level}
            active={nivel === level}
            onClick={() => setFilter("nivel", level)}
            label={level}
            small
          />
        ))}

        {hasFilters && (
          <button
            onClick={() => router.push(pathname)}
            className="ml-1 flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[0.75rem] text-brand transition hover:bg-brand/10"
          >
            <X className="h-3 w-3" />
            Limpar filtros
          </button>
        )}
      </div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  label,
  color,
  small,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  color?: string;
  small?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full whitespace-nowrap ring-1 transition-all duration-300",
        small ? "px-3 py-1.5 text-[0.75rem]" : "px-4 py-2 text-[0.82rem]",
        active
          ? "bg-brand text-white ring-brand"
          : "bg-surface-1 text-neutral-300 ring-white/10 hover:bg-surface-2 hover:text-white hover:ring-white/20",
      )}
      style={active && color ? { backgroundColor: color, borderColor: color } : undefined}
    >
      {label}
    </button>
  );
}
