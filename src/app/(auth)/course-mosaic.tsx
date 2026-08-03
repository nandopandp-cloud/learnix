import { cn } from "@/lib/utils";

/**
 * Cards decorativos do fundo do painel de login. São fixos de propósito:
 * o catálogo real ainda é pequeno demais para preencher duas colunas sem
 * repetição óbvia. A arte de cada card é um gradiente em CSS, então o
 * mosaico não depende de nenhuma imagem externa.
 */
type MosaicCard = {
  category: string;
  title: string;
  subtitle: string;
  lessons: number;
  /** Progresso da barra inferior, em % — puramente decorativo. */
  progress: number;
  art: string;
};

const COLUMN_A: MosaicCard[] = [
  {
    category: "Design",
    title: "UI/UX Design",
    subtitle: "Do básico ao avançado",
    lessons: 8,
    progress: 62,
    art: "linear-gradient(140deg,#3b1d5e 0%,#7c2d6b 45%,#16121f 100%)",
  },
  {
    category: "Marketing",
    title: "Marketing Digital",
    subtitle: "Estratégias que funcionam",
    lessons: 10,
    progress: 45,
    art: "linear-gradient(140deg,#123a52 0%,#2b6e7a 50%,#101a20 100%)",
  },
  {
    category: "Negócios",
    title: "Gestão de Projetos",
    subtitle: "Metodologias ágeis",
    lessons: 6,
    progress: 78,
    art: "linear-gradient(140deg,#4a2415 0%,#8a4a22 48%,#1a1310 100%)",
  },
  {
    category: "Dados",
    title: "Análise de Dados",
    subtitle: "Do dado à decisão",
    lessons: 12,
    progress: 33,
    art: "linear-gradient(140deg,#14304a 0%,#2f5fa3 50%,#0e1520 100%)",
  },
];

const COLUMN_B: MosaicCard[] = [
  {
    category: "Programação",
    title: "JavaScript Completo",
    subtitle: "Do zero ao avançado",
    lessons: 12,
    progress: 54,
    art: "linear-gradient(140deg,#3d2f0d 0%,#8a6b1c 46%,#171308 100%)",
  },
  {
    category: "Fotografia",
    title: "Fotografia Profissional",
    subtitle: "Técnicas e edição",
    lessons: 7,
    progress: 70,
    art: "linear-gradient(140deg,#2b1a3f 0%,#5b3a86 50%,#141020 100%)",
  },
  {
    category: "Produtividade",
    title: "Produtividade Máxima",
    subtitle: "Organize sua rotina",
    lessons: 5,
    progress: 88,
    art: "linear-gradient(140deg,#123b2c 0%,#2a7a55 50%,#0d1a15 100%)",
  },
  {
    category: "Carreira",
    title: "Comunicação e Liderança",
    subtitle: "Presença que convence",
    lessons: 9,
    progress: 41,
    art: "linear-gradient(140deg,#4a1620 0%,#93233a 48%,#1a0e12 100%)",
  },
];

export function CourseMosaic() {
  return (
    /* Termina antes do formulário (que ocupa 46% da largura) em vez de usar
       largura fixa, para a emenda nunca cair sobre os campos. */
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-y-0 right-[46%] left-[30%] hidden select-none lg:block"
    >
      {/* Duas colunas correndo em sentidos opostos, em ritmos diferentes. */}
      <div className="mask-y flex h-full gap-3.5">
        <MosaicColumn cards={COLUMN_A} duration="58s" />
        <MosaicColumn cards={COLUMN_B} duration="72s" reverse offset />
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
  cards: MosaicCard[];
  duration: string;
  reverse?: boolean;
  offset?: boolean;
}) {
  // A lista é duplicada para o loop do marquee emendar sem salto.
  const loop = [...cards, ...cards];

  return (
    <div className={cn("min-w-0 flex-1", offset && "-mt-24")}>
      <div
        className="flex flex-col gap-4"
        style={{
          animation: `marqueeY ${duration} linear infinite`,
          animationDirection: reverse ? "reverse" : "normal",
        }}
      >
        {loop.map((card, i) => (
          <MosaicCardItem key={`${card.title}-${i}`} card={card} />
        ))}
      </div>
    </div>
  );
}

function MosaicCardItem({ card }: { card: MosaicCard }) {
  return (
    <article className="overflow-hidden rounded-lg bg-surface-1 ring-1 ring-white/[0.06]">
      <div
        className="relative aspect-[16/11] w-full"
        style={{ backgroundImage: card.art }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
      </div>

      <div className="p-3">
        <p className="font-mono text-[0.5rem] tracking-[0.2em] text-neutral-500 uppercase">
          {card.category}
        </p>
        <h3 className="mt-1 truncate text-[0.76rem] font-medium text-white">
          {card.title}
        </h3>
        <p className="mt-0.5 truncate text-[0.66rem] text-neutral-500">
          {card.subtitle}
        </p>
        <p className="mt-2 text-[0.62rem] text-neutral-600">
          {card.lessons} aulas
        </p>
        <div className="mt-1.5 h-[2px] w-full overflow-hidden rounded-full bg-white/[0.07]">
          <div
            className="h-full rounded-full bg-brand"
            style={{ width: `${card.progress}%` }}
          />
        </div>
      </div>
    </article>
  );
}
