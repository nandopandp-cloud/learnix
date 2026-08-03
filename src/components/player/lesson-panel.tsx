"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import {
  ThumbsUp,
  Bookmark,
  CheckCircle2,
  Circle,
  FileText,
  Download,
  Loader2,
  ChevronDown,
  ExternalLink,
} from "lucide-react";

import { cn, formatCount } from "@/lib/utils";
import { toggleLessonComplete, toggleLessonLike } from "@/app/(app)/actions";
import { Button } from "@/components/ui/button";
import { NotesPanel } from "./notes-panel";
import type { CourseDetail } from "@/lib/queries";

type Lesson = CourseDetail["lessons"][number];
type Material = CourseDetail["materials"][number];

const TABS = ["Sobre a aula", "Materiais", "Anotações"] as const;

export function LessonPanel({
  course,
  lesson,
  materials,
  completed,
  likeCount,
  liked: initiallyLiked,
}: {
  course: CourseDetail;
  lesson: Lesson;
  materials: Material[];
  completed: boolean;
  likeCount: number;
  liked: boolean;
}) {
  const [active, setActive] = useState<(typeof TABS)[number]>("Sobre a aula");
  const [done, setDone] = useState(completed);
  const [pending, startTransition] = useTransition();
  const [liked, setLiked] = useState(initiallyLiked);
  const [likes, setLikes] = useState(likeCount);
  const [likePending, startLikeTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  const onToggleComplete = () => {
    setDone((d) => !d);
    startTransition(async () => {
      const result = await toggleLessonComplete(lesson.id, course.id);
      setDone(result.completed);
    });
  };

  const onToggleLike = () => {
    // Otimista: reflete na hora, corrige com a contagem real do servidor.
    setLiked((l) => !l);
    setLikes((n) => (liked ? n - 1 : n + 1));
    startLikeTransition(async () => {
      const result = await toggleLessonLike(lesson.id);
      setLiked(result.liked);
      setLikes(result.count);
    });
  };

  return (
    <div className="mt-6">
      {/* Cabeçalho da aula */}
      <div className="grid gap-5 lg:grid-cols-[1fr_20rem]">
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-bold tracking-tight text-white sm:text-[1.75rem]">
            {lesson.title}
          </h1>
          <p className="mt-1 text-[0.88rem] text-neutral-500">{course.title}</p>

          {lesson.description && (
            <p className="mt-4 max-w-2xl text-[0.9rem] leading-relaxed text-neutral-400">
              {lesson.description}
            </p>
          )}

          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3">
            <button
              onClick={onToggleLike}
              disabled={likePending}
              className={cn(
                "flex items-center gap-2 text-[0.83rem] transition-colors",
                liked ? "text-brand" : "text-neutral-400 hover:text-white",
              )}
            >
              <ThumbsUp
                className={cn("h-[1.05rem] w-[1.05rem]", liked && "fill-current")}
              />
              {formatCount(likes)}
            </button>

            <button
              onClick={() => setSaved((s) => !s)}
              className={cn(
                "flex items-center gap-2 text-[0.83rem] transition-colors",
                saved ? "text-brand" : "text-neutral-400 hover:text-white",
              )}
            >
              <Bookmark
                className={cn("h-[1.05rem] w-[1.05rem]", saved && "fill-current")}
              />
              {saved ? "Salva" : "Salvar na minha lista"}
            </button>

            <Button
              variant={done ? "secondary" : "outline"}
              size="sm"
              onClick={onToggleComplete}
              disabled={pending}
              className="ml-auto"
            >
              {pending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : done ? (
                <CheckCircle2 className="h-4 w-4 text-brand" />
              ) : (
                <Circle className="h-4 w-4" />
              )}
              {done ? "Aula concluída" : "Marcar como concluída"}
            </Button>
          </div>
        </div>

        {/* Cartão do instrutor */}
        <InstructorCard course={course} />
      </div>

      {/* Abas */}
      <div className="mt-8 mb-5 flex gap-1 border-b border-white/[0.07]">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActive(tab)}
            className={cn(
              "relative px-4 py-3 text-[0.86rem] transition-colors duration-300",
              active === tab
                ? "font-medium text-white"
                : "text-neutral-500 hover:text-neutral-300",
            )}
          >
            {tab}
            <span
              className={cn(
                "absolute right-3 -bottom-px left-3 h-[2px] rounded-full bg-brand transition-all duration-300",
                active === tab ? "opacity-100" : "scale-x-0 opacity-0",
              )}
            />
          </button>
        ))}
      </div>

      <div
        key={active}
        style={{ animation: "animationIn 0.45s var(--ease-out-expo) both" }}
      >
        {active === "Sobre a aula" && <AboutTab lesson={lesson} />}
        {active === "Materiais" && <MaterialsList materials={materials} />}
        {active === "Anotações" && <NotesPanel lessonId={lesson.id} />}
      </div>
    </div>
  );
}

/** Cartão do instrutor: sem link morto, com a bio expansível em vez de truncada. */
function InstructorCard({ course }: { course: CourseDetail }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="h-fit rounded-xl bg-surface-1 p-4 ring-1 ring-white/[0.07]">
      <div className="flex items-center gap-3">
        <span className="relative block h-11 w-11 shrink-0 overflow-hidden rounded-full bg-surface-2 ring-1 ring-white/10">
          {course.instructorAvatar && (
            <Image
              src={course.instructorAvatar}
              alt={course.instructorName ?? ""}
              fill
              sizes="44px"
              className="object-cover"
            />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[0.88rem] font-medium text-white">
            {course.instructorName}
          </p>
          <p className="truncate text-[0.75rem] text-neutral-500">
            {course.instructorTitle}
          </p>
        </div>
      </div>

      {course.instructorBio && (
        <>
          <p
            className={cn(
              "mt-3 text-[0.78rem] leading-relaxed text-neutral-500",
              !expanded && "line-clamp-3",
            )}
          >
            {course.instructorBio}
          </p>
          <button
            onClick={() => setExpanded((e) => !e)}
            className="mt-2 flex items-center gap-1 text-[0.75rem] font-medium text-brand transition hover:text-brand-bright"
          >
            {expanded ? "Ver menos" : "Ver mais"}
            <ChevronDown
              className={cn(
                "h-3.5 w-3.5 transition-transform duration-300",
                expanded && "rotate-180",
              )}
            />
          </button>
        </>
      )}
    </div>
  );
}

function AboutTab({ lesson }: { lesson: Lesson }) {
  if (lesson.learningPoints.length === 0) {
    return (
      <div className="rounded-xl bg-surface-1 p-6 ring-1 ring-white/[0.07]">
        <p className="text-[0.88rem] leading-relaxed text-neutral-400">
          {lesson.description ??
            "Assista à aula para acompanhar o conteúdo deste módulo."}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-surface-1 p-6 ring-1 ring-white/[0.07]">
      <h3 className="font-display text-[1.05rem] font-semibold text-white">
        O que você vai aprender
      </h3>
      <ul className="mt-4 grid gap-x-8 gap-y-3 sm:grid-cols-2">
        {lesson.learningPoints.map((point) => (
          <li key={point} className="flex items-start gap-2.5">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
            <span className="text-[0.85rem] leading-relaxed text-neutral-300">
              {point}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function MaterialsList({ materials }: { materials: Material[] }) {
  if (materials.length === 0) {
    return (
      <div className="rounded-xl bg-surface-1 p-8 text-center ring-1 ring-white/[0.07]">
        <FileText className="mx-auto h-8 w-8 text-neutral-600" />
        <p className="mt-3 text-[0.85rem] text-neutral-500">
          Esta aula ainda não tem materiais de apoio.
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-2.5">
      {materials.map((material) => {
        const isLink = material.fileType === "link";
        return (
          <li key={material.id}>
            <a
              href={material.fileUrl}
              {...(isLink
                ? { target: "_blank", rel: "noopener noreferrer" }
                : { download: true })}
              className="group flex items-center gap-4 rounded-xl bg-surface-1 p-4 ring-1 ring-white/[0.07] transition-all duration-300 hover:bg-surface-2 hover:ring-white/15"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand/10 ring-1 ring-brand/20">
                {isLink ? (
                  <ExternalLink className="h-[1.1rem] w-[1.1rem] text-brand" />
                ) : (
                  <FileText className="h-[1.1rem] w-[1.1rem] text-brand" />
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[0.88rem] font-medium text-white">
                  {material.title}
                </span>
                <span className="text-[0.73rem] text-neutral-500">
                  <span className="uppercase">
                    {isLink ? "Link externo" : material.fileType}
                  </span>
                  {material.sizeLabel && ` · ${material.sizeLabel}`}
                </span>
              </span>
              {isLink ? (
                <ExternalLink className="h-4 w-4 shrink-0 text-neutral-500 transition group-hover:text-white" />
              ) : (
                <Download className="h-4 w-4 shrink-0 text-neutral-500 transition group-hover:text-white" />
              )}
            </a>
          </li>
        );
      })}
    </ul>
  );
}
