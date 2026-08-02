"use client";

import { useState, useTransition } from "react";
import { MessageCircle, Trash2 } from "lucide-react";

import { cn, formatCount } from "@/lib/utils";
import type { CourseReviews } from "@/lib/queries";
import { StarRating, StarRatingInput } from "@/components/ui/star-rating";
import { rateCourse, deleteMyRating } from "@/app/(app)/actions";
import { Avatar } from "@/components/ui/avatar";

export function ReviewsTab({
  courseId,
  data,
  currentUserId,
}: {
  courseId: string;
  data: CourseReviews;
  currentUserId: string | null;
}) {
  const [stars, setStars] = useState(data.myRating?.stars ?? 0);
  const [comment, setComment] = useState(data.myRating?.comment ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const editing = Boolean(data.myRating);

  const submit = () => {
    if (stars < 1) {
      setError("Escolha de 1 a 5 estrelas.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await rateCourse(courseId, stars, comment);
      if (result?.error) setError(result.error);
    });
  };

  const remove = () => {
    startTransition(async () => {
      await deleteMyRating(courseId);
      setStars(0);
      setComment("");
    });
  };

  return (
    <div className="space-y-8">
      {/* Resumo */}
      <div className="flex flex-col gap-8 rounded-xl bg-surface-1 p-6 ring-1 ring-white/[0.07] sm:flex-row sm:items-center">
        <div className="text-center sm:w-40 sm:shrink-0">
          <p className="font-display text-5xl font-bold text-white">
            {data.average.toFixed(1).replace(".", ",")}
          </p>
          <StarRating value={data.average} className="mt-2 justify-center" />
          <p className="mt-2 text-[0.75rem] text-neutral-500">
            {data.count === 0
              ? "Sem avaliações"
              : `${formatCount(data.count)} ${
                  data.count === 1 ? "avaliação" : "avaliações"
                }`}
          </p>
        </div>

        <div className="flex-1 space-y-2">
          {data.distribution.map(({ stars: s, pct }) => (
            <div key={s} className="flex items-center gap-3">
              <span className="w-10 shrink-0 text-right font-mono text-[0.72rem] text-neutral-500">
                {s}★
              </span>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.08]">
                <div
                  className="h-full rounded-full bg-amber-400/80 transition-all duration-1000 ease-[var(--ease-out-quint)]"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="w-9 shrink-0 font-mono text-[0.72rem] text-neutral-500">
                {pct}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Formulário */}
      {currentUserId ? (
        <div className="rounded-xl bg-surface-1 p-6 ring-1 ring-white/[0.07]">
          <div className="flex items-baseline justify-between gap-4">
            <h3 className="font-display text-[1.05rem] font-semibold text-white">
              {editing ? "Sua avaliação" : "Avalie este curso"}
            </h3>
            {editing && (
              <button
                onClick={remove}
                disabled={pending}
                className="flex items-center gap-1.5 text-[0.78rem] text-neutral-500 transition hover:text-brand disabled:opacity-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Remover
              </button>
            )}
          </div>

          <div className="mt-4 flex items-center gap-3">
            <StarRatingInput
              value={stars}
              onChange={setStars}
              disabled={pending}
            />
            {stars > 0 && (
              <span className="text-[0.82rem] text-neutral-400">
                {stars} de 5
              </span>
            )}
          </div>

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            disabled={pending}
            rows={3}
            placeholder="Conte o que achou do curso (opcional)"
            className="mt-4 w-full resize-none rounded-lg bg-surface-2 px-3.5 py-3 text-[0.88rem] text-white ring-1 ring-white/[0.07] transition outline-none placeholder:text-neutral-600 focus:ring-brand/50 disabled:opacity-50"
          />

          {error && (
            <p className="mt-2 text-[0.8rem] text-brand-bright">{error}</p>
          )}

          <button
            onClick={submit}
            disabled={pending}
            className="mt-4 rounded-lg bg-brand px-4 py-2 text-[0.85rem] font-medium text-white transition hover:bg-brand-bright disabled:opacity-50"
          >
            {pending
              ? "Enviando…"
              : editing
                ? "Atualizar avaliação"
                : "Enviar avaliação"}
          </button>
        </div>
      ) : (
        <p className="rounded-xl bg-surface-1 px-6 py-5 text-center text-[0.85rem] text-neutral-500 ring-1 ring-white/[0.07]">
          Entre na sua conta para avaliar este curso.
        </p>
      )}

      {/* Lista */}
      {data.reviews.length === 0 ? (
        <div className="flex flex-col items-center rounded-xl bg-surface-1 px-6 py-14 text-center ring-1 ring-white/[0.07]">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-2 ring-1 ring-white/10">
            <MessageCircle className="h-5 w-5 text-neutral-500" />
          </span>
          <h3 className="mt-4 font-display text-[1.05rem] font-semibold text-white">
            Seja o primeiro a comentar
          </h3>
          <p className="mt-2 max-w-sm text-[0.85rem] leading-relaxed text-neutral-500">
            Deixe sua avaliação e ajude outros alunos a escolherem este curso.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {data.reviews.map((review) => (
            <li
              key={review.id}
              className={cn(
                "rounded-xl bg-surface-1 p-5 ring-1 ring-white/[0.07]",
                review.userId === currentUserId && "ring-brand/25",
              )}
            >
              <div className="flex items-center gap-3">
                <Avatar name={review.authorName} src={review.authorAvatar} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[0.88rem] font-medium text-white">
                    {review.authorName}
                    {review.userId === currentUserId && (
                      <span className="ml-2 rounded bg-brand/15 px-1.5 py-0.5 text-[0.6rem] font-medium text-brand">
                        Você
                      </span>
                    )}
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <StarRating value={review.stars} size="sm" />
                    <span className="text-[0.72rem] text-neutral-600">
                      {formatDate(review.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
              <p className="mt-3 text-[0.88rem] leading-relaxed whitespace-pre-line text-neutral-300">
                {review.comment}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}
