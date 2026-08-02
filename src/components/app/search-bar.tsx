"use client";

import { Search } from "lucide-react";

import { cn } from "@/lib/utils";
import { useCommandPalette } from "./command-palette-context";

/**
 * Gatilho da busca na topbar — visualmente um campo de texto, mas abre o
 * command palette (lightbox) em vez de expandir um dropdown local.
 */
export function SearchBar({ className }: { className?: string }) {
  const { setOpen } = useCommandPalette();

  return (
    <button
      onClick={() => setOpen(true)}
      className={cn(
        "flex h-11 items-center gap-2.5 rounded-full bg-surface-1 px-4",
        "ring-1 ring-white/10 transition-all duration-300",
        "hover:bg-surface-2 hover:ring-white/20",
        className,
      )}
    >
      <Search className="h-4 w-4 shrink-0 text-neutral-500" />
      <span className="flex-1 truncate text-left text-sm text-neutral-600">
        Buscar cursos, assuntos ou instrutores
      </span>
      <kbd className="hidden shrink-0 rounded border border-white/10 px-1.5 py-0.5 font-mono text-[0.6rem] text-neutral-600 lg:block">
        ⌘K
      </kbd>
    </button>
  );
}
