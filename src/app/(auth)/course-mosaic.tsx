import Image from "next/image";

import { cn, formatDuration } from "@/lib/utils";
import type { CourseCard } from "@/lib/queries";

/**
 * Cards de curso reais ao fundo do painel de autenticação. Puramente
 * decorativo: as capas do catálogo publicado passam em duas colunas
 * correndo em sentidos opostos.
 */
export function CourseMosaic({ courses }: { courses: CourseCard[] }) {
  if (courses.length === 0) return null;

  // Com poucos cursos, alternar o ponto de partida evita que as duas
  // colunas exibam o mesmo card lado a lado.
  const half = Math.ceil(courses.length / 2);
  const columnA = [...courses.slice(0, half), ...courses.slice(half)];
  const columnB = [...courses.slice(half), ...courses.slice(0, half)];

  return (
    /* Termina antes do formulário (que ocupa 46% da largura) em vez de usar
       largura fixa, para a emenda nunca cair sobre os campos. */
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-y-0 right-[46%] left-[30%] hidden select-none lg:block"
    >
      {/* Duas colunas correndo em sentidos opostos, em ritmos diferentes. */}
      <div className="mask-y flex h-full gap-3.5">
        <MosaicColumn cards={columnA} duration="58s" />
        <MosaicColumn cards={columnB} duration="72s" reverse offset />
      </div>

      {/* Escurece o mosaico e funde com o fundo, deixando o texto legível. */}
      <div className="absolute inset-0 bg-void/45" />
      <div className="absolute inset-y-0 -left-32 w-80 bg-gradient-to-r from-void via-void/92 to-transparent" />
      <div className="absolute inset-y-0 -right-24 w-64 bg-gradient-to-l from-void via-void/85 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-void to-transparent" />
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-void to-transparent" />
    </div>
  );
}

function MosaicColumn({
  cards,
  duration,
  reverse = false,
  offset = false,
}: {
  cards: CourseCard[];
  duration: string;
  reverse?: boolean;
  offset?: boolean;
}) {
  // Com catálogo pequeno, repete até ter altura suficiente para o loop
  // não deixar buraco visível; depois duplica para a emenda do marquee.
  const filled =
    cards.length >= 4
      ? cards
      : Array.from(
          { length: Math.ceil(4 / cards.length) },
          () => cards,
        ).flat();
  const loop = [...filled, ...filled];

  return (
    <div className={cn("min-w-0 flex-1", offset && "-mt-24")}>
      <div
        className="flex flex-col gap-3.5"
        style={{
          animation: `marqueeY ${duration} linear infinite`,
          animationDirection: reverse ? "reverse" : "normal",
        }}
      >
        {loop.map((card, i) => (
          <MosaicCardItem key={`${card.id}-${i}`} card={card} />
        ))}
      </div>
    </div>
  );
}

function MosaicCardItem({ card }: { card: CourseCard }) {
  return (
    <article className="overflow-hidden rounded-lg bg-surface-1 ring-1 ring-white/[0.06]">
      <div className="relative aspect-[16/10] w-full bg-surface-2">
        {card.thumbnailUrl && (
          <Image
            src={card.thumbnailUrl}
            alt=""
            fill
            sizes="16rem"
            className="object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
      </div>

      <div className="p-3">
        {card.categoryName && (
          <p className="font-mono text-[0.5rem] tracking-[0.2em] text-neutral-500 uppercase">
            {card.categoryName}
          </p>
        )}
        <h3 className="mt-1 truncate text-[0.76rem] font-medium text-white">
          {card.title}
        </h3>
        {card.tagline && (
          <p className="mt-0.5 truncate text-[0.66rem] text-neutral-500">
            {card.tagline}
          </p>
        )}
        <p className="mt-2 text-[0.62rem] text-neutral-600">
          {card.lessonCount} {card.lessonCount === 1 ? "aula" : "aulas"}
          {card.totalDuration > 0 && ` · ${formatDuration(card.totalDuration)}`}
        </p>
      </div>
    </article>
  );
}
