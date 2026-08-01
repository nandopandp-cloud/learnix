"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { Reveal } from "@/components/ui/reveal";

/**
 * Fileira horizontal estilo Netflix: scroll-snap, máscara alfa nas bordas e
 * setas que só aparecem quando há para onde ir.
 */
export function CourseRow({
  title,
  href,
  children,
  delay = 0,
}: {
  title: string;
  /** link opcional de "Ver tudo" */
  href?: string;
  children: React.ReactNode;
  delay?: number;
}) {
  const scroller = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const update = useCallback(() => {
    const el = scroller.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 8);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  }, []);

  useEffect(() => {
    update();
    const el = scroller.current;
    if (!el) return;

    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);

    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, [update]);

  const scrollBy = (direction: 1 | -1) => {
    const el = scroller.current;
    if (!el) return;
    // Avança ~85% da área visível, deixando contexto na tela.
    el.scrollBy({ left: direction * el.clientWidth * 0.85, behavior: "smooth" });
  };

  return (
    <section className="group/row relative">
      <Reveal delay={delay} className="mb-4 flex items-end justify-between px-4 lg:px-8">
        <h2 className="font-display text-[1.35rem] font-semibold tracking-tight text-white">
          {title}
        </h2>
        {href && (
          <Link
            href={href}
            className="group/link flex items-center gap-1.5 text-[0.8rem] text-brand transition-colors hover:text-brand-bright"
          >
            Ver tudo
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover/link:translate-x-1" />
          </Link>
        )}
      </Reveal>

      <div className="relative">
        {/* Seta esquerda */}
        <button
          onClick={() => scrollBy(-1)}
          aria-label="Anterior"
          className={cn(
            "absolute top-1/2 left-2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full",
            "glass text-white ring-1 ring-white/15 transition-all duration-300",
            "hover:scale-110 hover:bg-brand hover:ring-brand",
            "opacity-0 group-hover/row:opacity-100",
            canLeft ? "md:flex" : "md:hidden",
          )}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        {/* Seta direita */}
        <button
          onClick={() => scrollBy(1)}
          aria-label="Próximo"
          className={cn(
            "absolute top-1/2 right-2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full",
            "glass text-white ring-1 ring-white/15 transition-all duration-300",
            "hover:scale-110 hover:bg-brand hover:ring-brand",
            "opacity-0 group-hover/row:opacity-100",
            canRight ? "md:flex" : "md:hidden",
          )}
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        <div
          ref={scroller}
          className="hide-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-4 pt-1 pb-4 lg:px-8"
        >
          {children}
        </div>
      </div>
    </section>
  );
}

/** Item da fileira com snap e entrada escalonada. */
export function RowItem({
  children,
  index = 0,
}: {
  children: React.ReactNode;
  index?: number;
}) {
  return (
    <Reveal
      delay={Math.min(index * 0.05, 0.4)}
      className="snap-start"
    >
      {children}
    </Reveal>
  );
}
