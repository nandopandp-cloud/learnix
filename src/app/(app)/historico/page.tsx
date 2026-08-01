import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { History, Play, CheckCircle2 } from "lucide-react";

import { getCurrentUser } from "@/lib/auth";
import { getHistory } from "@/lib/queries";
import { formatTimecode } from "@/lib/utils";
import { PageHeader, EmptyState } from "@/components/app/page-header";
import { Reveal } from "@/components/ui/reveal";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Histórico" };

export default async function HistoricoPage() {
  const user = (await getCurrentUser())!;
  const history = await getHistory(user.id);

  return (
    <div>
      <PageHeader
        eyebrow="Atividade"
        title="Histórico"
        description="As aulas que você assistiu recentemente."
      />

      {history.length === 0 ? (
        <EmptyState
          icon={History}
          title="Nada por aqui ainda"
          description="Assim que você assistir sua primeira aula, ela aparecerá neste histórico."
          action={
            <Button asChild shimmer>
              <Link href="/explorar">Começar a assistir</Link>
            </Button>
          }
        />
      ) : (
        <ul className="space-y-2.5 px-4 lg:px-8">
          {history.map((item, i) => {
            const pct = item.duration
              ? Math.min(100, (item.positionSeconds / item.duration) * 100)
              : 0;

            return (
              <Reveal key={item.lessonId} delay={Math.min(i * 0.03, 0.35)}>
                <Link
                  href={`/assistir/${item.courseSlug}/${item.lessonSlug}`}
                  className="group flex items-center gap-4 rounded-xl bg-surface-1 p-3 ring-1 ring-white/[0.07] transition-all duration-300 hover:bg-surface-2 hover:ring-white/15"
                >
                  <div className="relative aspect-video w-32 shrink-0 overflow-hidden rounded-lg bg-surface-2 sm:w-40">
                    {item.thumbnailUrl && (
                      <Image
                        src={item.thumbnailUrl}
                        alt=""
                        fill
                        sizes="160px"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    )}
                    <div className="absolute inset-0 bg-black/30" />
                    <span className="absolute top-1/2 left-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 scale-75 items-center justify-center rounded-full bg-brand opacity-0 transition-all duration-400 group-hover:scale-100 group-hover:opacity-100">
                      <Play className="ml-0.5 h-4 w-4 fill-white text-white" />
                    </span>

                    {pct > 0 && (
                      <div className="absolute inset-x-0 bottom-0 h-[3px] bg-white/25">
                        <div
                          className="h-full bg-brand"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[0.6rem] tracking-[0.14em] text-neutral-600 uppercase">
                      {item.categoryName}
                    </p>
                    <h3 className="mt-1 truncate text-[0.92rem] font-medium text-white">
                      {item.lessonTitle}
                    </h3>
                    <p className="mt-0.5 truncate text-[0.78rem] text-neutral-500">
                      {item.courseTitle}
                    </p>
                    <p className="mt-1.5 font-mono text-[0.72rem] text-neutral-600">
                      {formatTimecode(item.positionSeconds)} /{" "}
                      {formatTimecode(item.duration)}
                    </p>
                  </div>

                  {item.completed && (
                    <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-brand/12 px-2.5 py-1 text-[0.7rem] text-brand">
                      <CheckCircle2 className="h-3 w-3" />
                      Concluída
                    </span>
                  )}
                </Link>
              </Reveal>
            );
          })}
        </ul>
      )}
    </div>
  );
}
