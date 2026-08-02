"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Search,
  Loader2,
  CornerDownLeft,
  ArrowRight,
  Compass,
  Sparkles,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useCommandPalette } from "./command-palette-context";

type Result = {
  id: string;
  title: string;
  slug: string;
  thumbnailUrl: string | null;
  categoryName: string | null;
  instructorName: string | null;
  lessonCount: number;
};

/**
 * Busca em lightbox: abre por cima de tudo, com o input em evidência e os
 * resultados logo abaixo. Substitui o dropdown inline por uma experiência
 * mais imersiva, no espírito de um command palette (⌘K).
 */
export function CommandPalette() {
  const { open, setOpen } = useCommandPalette();
  const router = useRouter();
  const [term, setTerm] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  /* Zera a busca sempre que o palette fecha, para abrir limpo da próxima vez. */
  useEffect(() => {
    if (!open) {
      const t = setTimeout(() => {
        setTerm("");
        setResults([]);
        setHighlight(0);
      }, 200);
      return () => clearTimeout(t);
    }
    // Foca o input assim que a animação de entrada começa.
    const t = setTimeout(() => inputRef.current?.focus(), 50);
    return () => clearTimeout(t);
  }, [open]);

  /* Busca com debounce */
  useEffect(() => {
    if (!open) return;
    const q = term.trim();
    const controller = new AbortController();

    if (q.length < 2) {
      const reset = setTimeout(() => {
        setResults([]);
        setLoading(false);
      }, 0);
      return () => clearTimeout(reset);
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, {
          signal: controller.signal,
        });
        const data = await res.json();
        setResults(data.results ?? []);
        setHighlight(0);
      } catch {
        /* requisição substituída por outra mais recente */
      } finally {
        setLoading(false);
      }
    }, 220);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [term, open]);

  /* Bloqueia o scroll do body enquanto o palette está aberto. */
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const go = (slug: string) => {
    setOpen(false);
    router.push(`/cursos/${slug}`);
  };

  const goToSearch = () => {
    const q = term.trim();
    if (!q) return;
    setOpen(false);
    router.push(`/explorar?q=${encodeURIComponent(q)}`);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (results[highlight]) go(results[highlight].slug);
      else goToSearch();
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  if (!open) return null;

  const hasQuery = term.trim().length >= 2;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center px-4 pt-[12vh] sm:pt-[16vh]">
      <button
        aria-label="Fechar busca"
        onClick={() => setOpen(false)}
        className="absolute inset-0 bg-black/75 backdrop-blur-md"
        style={{ animation: "fadeIn 0.2s ease-out both" }}
      />

      <div
        className="glass-strong relative flex w-full max-w-2xl flex-col overflow-hidden rounded-2xl ring-1 ring-white/12 shadow-2xl"
        style={{ animation: "animationIn 0.35s var(--ease-out-expo) both" }}
      >
        {/* Campo de busca em evidência */}
        <div className="flex items-center gap-3.5 border-b border-white/[0.08] px-5 py-4 sm:px-6 sm:py-5">
          {loading ? (
            <Loader2 className="h-5 w-5 shrink-0 animate-spin text-brand" />
          ) : (
            <Search className="h-5 w-5 shrink-0 text-neutral-500" />
          )}
          <input
            ref={inputRef}
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Buscar cursos, assuntos ou instrutores…"
            className="w-full bg-transparent text-lg text-white placeholder:text-neutral-600 focus:outline-none focus-visible:!outline-none sm:text-xl"
          />
          <kbd className="hidden shrink-0 rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 font-mono text-[0.65rem] text-neutral-500 sm:block">
            ESC
          </kbd>
        </div>

        {/* Resultados */}
        <div className="max-h-[26rem] overflow-y-auto thin-scrollbar">
          {!hasQuery ? (
            <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand/10 ring-1 ring-brand/20">
                <Sparkles className="h-5 w-5 text-brand" />
              </span>
              <p className="text-sm text-neutral-400">
                Digite ao menos 2 letras para buscar no catálogo.
              </p>
            </div>
          ) : results.length === 0 && !loading ? (
            <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-surface-2 ring-1 ring-white/10">
                <Compass className="h-5 w-5 text-neutral-500" />
              </span>
              <p className="text-sm text-neutral-400">
                Nenhum curso encontrado para{" "}
                <span className="text-white">“{term}”</span>
              </p>
            </div>
          ) : (
            <ul className="p-2">
              {results.map((r, i) => (
                <li key={r.id}>
                  <button
                    onClick={() => go(r.slug)}
                    onMouseEnter={() => setHighlight(i)}
                    className={cn(
                      "flex w-full items-center gap-3.5 rounded-xl px-3 py-2.5 text-left transition-colors",
                      i === highlight ? "bg-white/[0.08]" : "hover:bg-white/[0.04]",
                    )}
                  >
                    <div className="relative h-12 w-[5rem] shrink-0 overflow-hidden rounded-lg bg-surface-2">
                      {r.thumbnailUrl && (
                        <Image
                          src={r.thumbnailUrl}
                          alt=""
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[0.92rem] font-medium text-white">
                        {r.title}
                      </p>
                      <p className="mt-0.5 truncate text-[0.75rem] text-neutral-500">
                        {r.categoryName} · {r.instructorName} · {r.lessonCount}{" "}
                        aulas
                      </p>
                    </div>
                    {i === highlight && (
                      <CornerDownLeft className="h-4 w-4 shrink-0 text-neutral-500" />
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Rodapé com atalhos */}
        <div className="flex items-center justify-between border-t border-white/[0.08] px-5 py-3 text-[0.7rem] text-neutral-500 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-white/10 px-1.5 py-0.5 font-mono">
                ↑
              </kbd>
              <kbd className="rounded border border-white/10 px-1.5 py-0.5 font-mono">
                ↓
              </kbd>
              navegar
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-white/10 px-1.5 py-0.5 font-mono">
                ↵
              </kbd>
              selecionar
            </span>
          </div>
          {hasQuery && (
            <button
              onClick={goToSearch}
              className="group flex items-center gap-1.5 text-brand transition hover:text-brand-bright"
            >
              Ver todos os resultados
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
