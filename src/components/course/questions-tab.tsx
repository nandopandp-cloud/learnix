"use client";

import { useState, useTransition } from "react";
import { MessageCircle, Trash2, CornerDownRight } from "lucide-react";

import type { CourseQuestions } from "@/lib/queries";
import { Avatar } from "@/components/ui/avatar";
import {
  askQuestion,
  answerQuestion,
  deleteQuestion,
  deleteAnswer,
} from "@/app/(app)/actions";

type Question = CourseQuestions[number];

export function QuestionsTab({
  courseId,
  questions,
  currentUserId,
  isAdmin,
}: {
  courseId: string;
  questions: CourseQuestions;
  currentUserId: string | null;
  isAdmin: boolean;
}) {
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const submit = () => {
    if (!content.trim()) {
      setError("Escreva sua pergunta.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await askQuestion(courseId, content);
      if (result?.error) setError(result.error);
      else setContent("");
    });
  };

  return (
    <div className="space-y-8">
      {currentUserId ? (
        <div className="rounded-xl bg-surface-1 p-6 ring-1 ring-white/[0.07]">
          <h3 className="font-display text-[1.05rem] font-semibold text-white">
            Fazer uma pergunta
          </h3>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={pending}
            rows={3}
            placeholder="Qual é a sua dúvida sobre este curso?"
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
            {pending ? "Enviando…" : "Publicar pergunta"}
          </button>
        </div>
      ) : (
        <p className="rounded-xl bg-surface-1 px-6 py-5 text-center text-[0.85rem] text-neutral-500 ring-1 ring-white/[0.07]">
          Entre na sua conta para fazer uma pergunta.
        </p>
      )}

      {questions.length === 0 ? (
        <div className="flex flex-col items-center rounded-xl bg-surface-1 px-6 py-14 text-center ring-1 ring-white/[0.07]">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-2 ring-1 ring-white/10">
            <MessageCircle className="h-5 w-5 text-neutral-500" />
          </span>
          <h3 className="mt-4 font-display text-[1.05rem] font-semibold text-white">
            Nenhuma pergunta ainda
          </h3>
          <p className="mt-2 max-w-sm text-[0.85rem] leading-relaxed text-neutral-500">
            Tem alguma dúvida sobre o curso? Seja o primeiro a perguntar.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {questions.map((question) => (
            <QuestionCard
              key={question.id}
              question={question}
              currentUserId={currentUserId}
              isAdmin={isAdmin}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function QuestionCard({
  question,
  currentUserId,
  isAdmin,
}: {
  question: Question;
  currentUserId: string | null;
  isAdmin: boolean;
}) {
  const [replying, setReplying] = useState(false);
  const [reply, setReply] = useState("");
  const [pending, startTransition] = useTransition();

  const submitReply = () => {
    if (!reply.trim()) return;
    startTransition(async () => {
      await answerQuestion(question.id, reply);
      setReply("");
      setReplying(false);
    });
  };

  const canDelete = currentUserId === question.userId || isAdmin;

  return (
    <li className="rounded-xl bg-surface-1 p-5 ring-1 ring-white/[0.07]">
      <div className="flex items-start gap-3">
        <Avatar name={question.authorName} src={question.authorAvatar} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-[0.88rem] font-medium text-white">
              {question.authorName}
            </p>
            {question.authorRole === "admin" && (
              <span className="shrink-0 rounded bg-brand/15 px-1.5 py-0.5 text-[0.6rem] font-medium text-brand">
                Instrutor
              </span>
            )}
            <span className="shrink-0 text-[0.72rem] text-neutral-600">
              {formatDate(question.createdAt)}
            </span>
          </div>
          {question.lessonTitle && (
            <p className="mt-0.5 truncate text-[0.72rem] text-neutral-600">
              na aula &ldquo;{question.lessonTitle}&rdquo;
            </p>
          )}
          <p className="mt-2 text-[0.88rem] leading-relaxed whitespace-pre-line text-neutral-300">
            {question.content}
          </p>
        </div>
        {canDelete && (
          <button
            onClick={() =>
              startTransition(async () => {
                await deleteQuestion(question.id);
              })
            }
            disabled={pending}
            aria-label="Remover pergunta"
            className="shrink-0 text-neutral-600 transition hover:text-brand disabled:opacity-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {question.answers.length > 0 && (
        <ul className="mt-4 ml-12 space-y-3 border-l border-white/[0.07] pl-4">
          {question.answers.map((answer) => (
            <li key={answer.id} className="flex items-start gap-3">
              <Avatar
                name={answer.authorName}
                src={answer.authorAvatar}
                className="h-7 w-7"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-[0.82rem] font-medium text-white">
                    {answer.authorName}
                  </p>
                  {answer.authorRole === "admin" && (
                    <span className="shrink-0 rounded bg-brand/15 px-1.5 py-0.5 text-[0.6rem] font-medium text-brand">
                      Instrutor
                    </span>
                  )}
                  <span className="shrink-0 text-[0.7rem] text-neutral-600">
                    {formatDate(answer.createdAt)}
                  </span>
                </div>
                <p className="mt-1 text-[0.85rem] leading-relaxed whitespace-pre-line text-neutral-400">
                  {answer.content}
                </p>
              </div>
              {(currentUserId === answer.userId || isAdmin) && (
                <button
                  onClick={() =>
                    startTransition(async () => {
                      await deleteAnswer(answer.id);
                    })
                  }
                  disabled={pending}
                  aria-label="Remover resposta"
                  className="shrink-0 text-neutral-600 transition hover:text-brand disabled:opacity-50"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {currentUserId && (
        <div className="mt-4 ml-12 pl-4">
          {replying ? (
            <div>
              <textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                disabled={pending}
                rows={2}
                autoFocus
                placeholder="Escreva sua resposta"
                className="w-full resize-none rounded-lg bg-surface-2 px-3.5 py-2.5 text-[0.85rem] text-white ring-1 ring-white/[0.07] transition outline-none placeholder:text-neutral-600 focus:ring-brand/50 disabled:opacity-50"
              />
              <div className="mt-2 flex gap-2">
                <button
                  onClick={submitReply}
                  disabled={pending}
                  className="rounded-lg bg-brand px-3 py-1.5 text-[0.8rem] font-medium text-white transition hover:bg-brand-bright disabled:opacity-50"
                >
                  {pending ? "Enviando…" : "Responder"}
                </button>
                <button
                  onClick={() => {
                    setReplying(false);
                    setReply("");
                  }}
                  disabled={pending}
                  className="rounded-lg px-3 py-1.5 text-[0.8rem] text-neutral-400 transition hover:text-white disabled:opacity-50"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setReplying(true)}
              className="flex items-center gap-1.5 text-[0.8rem] text-neutral-500 transition hover:text-brand"
            >
              <CornerDownRight className="h-3.5 w-3.5" />
              Responder
            </button>
          )}
        </div>
      )}
    </li>
  );
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}
