"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Search, Loader2, CornerDownLeft } from "lucide-react";

import { cn } from "@/lib/utils";

type Result = {
  id: string;
  title: string;
  slug: string;
  thumbnailUrl: string | null;
  categoryName: string | null;
  instructorName: string | null;
  lessonCount: number;
};

export function SearchBar({ className }: { className?: string }) {
  const router = useRouter();
  const [term, setTerm] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  /* Busca com debounce */
  useEffect(() => {
    const q = term.trim();
    const controller = new AbortController();

    if (q.length < 2) {
      // Sem termo suficiente: limpa fora do corpo síncrono do efeito.
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
  }, [term]);

  /* Fecha ao clicar fora */
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  /* Atalho ⌘K / Ctrl+K */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const go = (slug: string) => {
    setOpen(false);
    setTerm("");
    router.push(`/cursos/${slug}`);
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
      else if (term.trim())
        router.push(`/explorar?q=${encodeURIComponent(term.trim())}`);
      setOpen(false);
    } else if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div
        className={cn(
          "flex h-10 items-center gap-2.5 rounded-full bg-surface-1 px-4",
          "ring-1 ring-white/10 transition-all duration-300",
          "focus-within:bg-surface-2 focus-within:ring-2 focus-within:ring-brand/50",
        )}
      >
        <Search className="h-4 w-4 shrink-0 text-neutral-500" />
        <input
          ref={inputRef}
          value={term}
          onChange={(e) => {
            setTerm(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Buscar cursos, assuntos ou instrutores"
          className="w-full bg-transparent text-sm text-white outline-none placeholder:text-neutral-600"
        />
        {loading ? (
          <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-neutral-500" />
        ) : (
          <kbd className="hidden shrink-0 rounded border border-white/10 px-1.5 py-0.5 font-mono text-[0.6rem] text-neutral-600 lg:block">
            ⌘K
          </kbd>
        )}
      </div>

      {open && term.trim().length >= 2 && (
        <div className="glass absolute top-full right-0 left-0 z-50 mt-2 overflow-hidden rounded-xl ring-1 ring-white/10 shadow-2xl">
          {results.length === 0 && !loading ? (
            <p className="px-4 py-6 text-center text-sm text-neutral-500">
              Nenhum curso encontrado para{" "}
              <span className="text-neutral-300">“{term}”</span>
            </p>
          ) : (
            <ul className="max-h-[22rem] overflow-y-auto thin-scrollbar py-1.5">
              {results.map((r, i) => (
                <li key={r.id}>
                  <button
                    onClick={() => go(r.slug)}
                    onMouseEnter={() => setHighlight(i)}
                    className={cn(
                      "flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors",
                      i === highlight ? "bg-white/[0.07]" : "hover:bg-white/[0.04]",
                    )}
                  >
                    <div className="relative h-11 w-[4.6rem] shrink-0 overflow-hidden rounded-md bg-surface-2">
                      {r.thumbnailUrl && (
                        <Image
                          src={r.thumbnailUrl}
                          alt=""
                          fill
                          sizes="74px"
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-white">
                        {r.title}
                      </p>
                      <p className="mt-0.5 truncate text-[0.72rem] text-neutral-500">
                        {r.categoryName} · {r.instructorName} · {r.lessonCount}{" "}
                        aulas
                      </p>
                    </div>
                    {i === highlight && (
                      <CornerDownLeft className="h-3.5 w-3.5 shrink-0 text-neutral-600" />
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
