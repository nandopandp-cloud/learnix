"use client";

import { useActionState, useState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import {
  Plus,
  Trash2,
  Loader2,
  ChevronDown,
  Pencil,
  X,
  Check,
} from "lucide-react";

import {
  createModule,
  deleteModule,
  updateModule,
  createLesson,
  deleteLesson,
  updateLesson,
  type FormState,
} from "../../actions";
import { cn, formatTimecode } from "@/lib/utils";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { FormMessage } from "@/components/ui/form-controls";
import { FileUpload } from "@/components/ui/file-upload";
import { CROP_ASPECT } from "@/lib/uploads";
import type { Module, Lesson } from "@/db/schema";

export function CurriculumEditor({
  courseId,
  modules,
  lessons,
}: {
  courseId: string;
  modules: Module[];
  lessons: Lesson[];
}) {
  const [newModule, setNewModule] = useState("");
  const [pending, startTransition] = useTransition();
  const [openId, setOpenId] = useState<string | null>(modules[0]?.id ?? null);

  const addModule = () => {
    const title = newModule.trim();
    if (!title) return;
    setNewModule("");
    startTransition(async () => {
      await createModule(courseId, title);
    });
  };

  return (
    <div className="space-y-4">
      <section className="rounded-xl bg-surface-1 p-5 ring-1 ring-white/[0.07]">
        <h2 className="font-display text-[1.05rem] font-semibold text-white">
          Módulos e aulas
        </h2>
        <p className="mt-1 text-[0.78rem] text-neutral-500">
          {modules.length} módulos · {lessons.length} aulas
        </p>

        <div className="mt-4 flex gap-2">
          <input
            value={newModule}
            onChange={(e) => setNewModule(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addModule()}
            placeholder="Nome do novo módulo"
            className="h-11 flex-1 rounded-lg bg-surface-2 px-3.5 text-[0.88rem] text-white ring-1 ring-white/10 outline-none transition placeholder:text-neutral-600 focus:ring-2 focus:ring-brand/70"
          />
          <button
            onClick={addModule}
            disabled={!newModule.trim() || pending}
            className="flex h-11 items-center gap-1.5 rounded-lg bg-brand px-4 text-[0.85rem] font-medium text-white transition hover:bg-brand-bright disabled:pointer-events-none disabled:opacity-40"
          >
            {pending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            Adicionar
          </button>
        </div>
      </section>

      {modules.length === 0 ? (
        <p className="rounded-xl bg-surface-1 p-8 text-center text-[0.85rem] text-neutral-500 ring-1 ring-white/[0.07]">
          Crie o primeiro módulo para começar a adicionar aulas.
        </p>
      ) : (
        <div className="space-y-2.5">
          {modules.map((module, i) => (
            <ModuleCard
              key={module.id}
              index={i}
              module={module}
              courseId={courseId}
              lessons={lessons.filter((l) => l.moduleId === module.id)}
              open={openId === module.id}
              onToggle={() =>
                setOpenId((id) => (id === module.id ? null : module.id))
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* -------------------------------- módulo ---------------------------------- */

function ModuleCard({
  module,
  courseId,
  lessons,
  open,
  onToggle,
  index,
}: {
  module: Module;
  courseId: string;
  lessons: Lesson[];
  open: boolean;
  onToggle: () => void;
  index: number;
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(module.title);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const save = () => {
    setEditing(false);
    startTransition(async () => {
      await updateModule(module.id, title);
    });
  };

  return (
    <div className="overflow-hidden rounded-xl bg-surface-1 ring-1 ring-white/[0.07]">
      <div className="flex items-center gap-2 px-4 py-3.5">
        <button onClick={onToggle} className="shrink-0">
          <ChevronDown
            className={cn(
              "h-4 w-4 text-neutral-500 transition-transform duration-300",
              open && "rotate-180",
            )}
          />
        </button>

        {editing ? (
          <>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") save();
                if (e.key === "Escape") {
                  setTitle(module.title);
                  setEditing(false);
                }
              }}
              autoFocus
              className="h-9 min-w-0 flex-1 rounded-lg bg-surface-2 px-3 text-[0.88rem] text-white ring-1 ring-brand/50 outline-none"
            />
            <button
              onClick={save}
              className="shrink-0 rounded p-1.5 text-emerald-400 transition hover:bg-emerald-500/10"
            >
              <Check className="h-4 w-4" />
            </button>
            <button
              onClick={() => {
                setTitle(module.title);
                setEditing(false);
              }}
              className="shrink-0 rounded p-1.5 text-neutral-500 transition hover:bg-white/5"
            >
              <X className="h-4 w-4" />
            </button>
          </>
        ) : (
          <>
            <button onClick={onToggle} className="min-w-0 flex-1 text-left">
              <span className="block truncate text-[0.9rem] font-medium text-white">
                {index + 1}. {module.title}
              </span>
              <span className="text-[0.74rem] text-neutral-500">
                {lessons.length} {lessons.length === 1 ? "aula" : "aulas"}
              </span>
            </button>

            {pending && (
              <Loader2 className="h-4 w-4 shrink-0 animate-spin text-neutral-500" />
            )}
            <button
              onClick={() => setEditing(true)}
              aria-label="Renomear módulo"
              className="shrink-0 rounded p-1.5 text-neutral-500 transition hover:bg-white/5 hover:text-white"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setConfirmOpen(true)}
              aria-label="Excluir módulo"
              className="shrink-0 rounded p-1.5 text-neutral-500 transition hover:bg-brand/10 hover:text-brand"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </>
        )}
      </div>

      {open && (
        <div className="border-t border-white/[0.07]">
          <ul className="divide-y divide-white/[0.05]">
            {lessons.map((lesson) => (
              <LessonRow key={lesson.id} lesson={lesson} courseId={courseId} />
            ))}
          </ul>
          <NewLessonForm courseId={courseId} moduleId={module.id} />
        </div>
      )}

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Excluir módulo"
        description={`Isso remove “${module.title}” e todas as suas aulas. Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir módulo"
        onConfirm={() => {
          setConfirmOpen(false);
          startTransition(async () => {
            await deleteModule(module.id, courseId);
          });
        }}
      />
    </div>
  );
}

/* --------------------------------- aula ----------------------------------- */

function LessonRow({ lesson, courseId }: { lesson: Lesson; courseId: string }) {
  const [editing, setEditing] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [state, formAction] = useActionState<FormState, FormData>(
    updateLesson,
    undefined,
  );

  if (editing) {
    return (
      <li className="bg-surface-2/50 p-4">
        <form
          action={(fd) => {
            formAction(fd);
            setEditing(false);
          }}
          className="space-y-3"
        >
          <input type="hidden" name="id" value={lesson.id} />
          <input type="hidden" name="courseId" value={courseId} />

          <input
            name="title"
            defaultValue={lesson.title}
            required
            className="h-10 w-full rounded-lg bg-surface-1 px-3 text-[0.86rem] text-white ring-1 ring-white/10 outline-none focus:ring-2 focus:ring-brand/70"
          />
          <FileUpload
            label="Vídeo da aula"
            kind="video"
            name="videoUrl"
            defaultValue={lesson.videoUrl}
          />
          <FileUpload
            label="Thumbnail da aula"
            kind="image"
            name="thumbnailUrl"
            defaultValue={lesson.thumbnailUrl}
            aspect={CROP_ASPECT.thumbnail}
            hint="Opcional — usa o backdrop do curso quando vazio."
          />
          <textarea
            name="description"
            defaultValue={lesson.description ?? ""}
            rows={2}
            placeholder="Descrição da aula"
            className="w-full resize-y rounded-lg bg-surface-1 px-3 py-2.5 text-[0.86rem] text-white ring-1 ring-white/10 outline-none focus:ring-2 focus:ring-brand/70"
          />

          <div className="flex items-center gap-3">
            <input
              name="durationMinutes"
              type="number"
              min={0}
              step="0.1"
              defaultValue={(lesson.duration / 60).toFixed(1)}
              className="h-10 w-28 rounded-lg bg-surface-1 px-3 text-[0.86rem] text-white ring-1 ring-white/10 outline-none focus:ring-2 focus:ring-brand/70"
            />
            <span className="text-[0.76rem] text-neutral-500">minutos</span>

            <label className="ml-auto flex cursor-pointer items-center gap-2 text-[0.8rem] text-neutral-300">
              <input
                type="checkbox"
                name="isFree"
                defaultChecked={lesson.isFree}
                className="h-4 w-4 accent-[#E50914]"
              />
              Aula gratuita
            </label>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="rounded-lg px-3 py-2 text-[0.82rem] text-neutral-400 transition hover:bg-white/5 hover:text-white"
            >
              Cancelar
            </button>
            <SaveLessonButton />
          </div>
        </form>
      </li>
    );
  }

  return (
    <li className="group flex items-center gap-3 px-4 py-3">
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[0.85rem] text-neutral-200">
          {lesson.title}
        </span>
        <span className="flex items-center gap-2 text-[0.72rem] text-neutral-600">
          {formatTimecode(lesson.duration)}
          {lesson.isFree && <span className="text-brand">· Grátis</span>}
          {!lesson.videoUrl && (
            <span className="text-amber-500">· Sem vídeo</span>
          )}
        </span>
      </span>

      {state?.error && <FormMessage error={state.error} />}
      {pending && (
        <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-neutral-500" />
      )}

      <button
        onClick={() => setEditing(true)}
        aria-label="Editar aula"
        className="shrink-0 rounded p-1.5 text-neutral-600 opacity-0 transition group-hover:opacity-100 hover:bg-white/5 hover:text-white"
      >
        <Pencil className="h-3.5 w-3.5" />
      </button>
      <button
        onClick={() => setConfirmOpen(true)}
        aria-label="Excluir aula"
        className="shrink-0 rounded p-1.5 text-neutral-600 opacity-0 transition group-hover:opacity-100 hover:bg-brand/10 hover:text-brand"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Excluir aula"
        description={`Isso remove “${lesson.title}” e o progresso dos alunos nesta aula.`}
        confirmLabel="Excluir aula"
        onConfirm={() => {
          setConfirmOpen(false);
          startTransition(async () => {
            await deleteLesson(lesson.id, courseId);
          });
        }}
      />
    </li>
  );
}

function SaveLessonButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex items-center gap-1.5 rounded-lg bg-brand px-3.5 py-2 text-[0.82rem] font-medium text-white transition hover:bg-brand-bright disabled:opacity-50"
    >
      {pending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
      Salvar
    </button>
  );
}

function NewLessonForm({
  courseId,
  moduleId,
}: {
  courseId: string;
  moduleId: string;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState<FormState, FormData>(
    createLesson,
    undefined,
  );

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-center gap-1.5 border-t border-white/[0.05] px-4 py-3 text-[0.82rem] text-neutral-400 transition hover:bg-white/[0.03] hover:text-white"
      >
        <Plus className="h-3.5 w-3.5" />
        Adicionar aula
      </button>
    );
  }

  return (
    <div className="border-t border-white/[0.05] bg-surface-2/40 p-4">
      <form action={formAction} className="space-y-3">
        <input type="hidden" name="courseId" value={courseId} />
        <input type="hidden" name="moduleId" value={moduleId} />

        <input
          name="title"
          placeholder="Título da aula"
          required
          autoFocus
          className="h-10 w-full rounded-lg bg-surface-1 px-3 text-[0.86rem] text-white ring-1 ring-white/10 outline-none focus:ring-2 focus:ring-brand/70"
        />
        <FileUpload label="Vídeo da aula" kind="video" name="videoUrl" />
        <FileUpload
          label="Thumbnail da aula"
          kind="image"
          name="thumbnailUrl"
          aspect={CROP_ASPECT.thumbnail}
          hint="Opcional — usa o backdrop do curso quando vazio."
        />
        <textarea
          name="description"
          rows={2}
          placeholder="Descrição da aula"
          className="w-full resize-y rounded-lg bg-surface-1 px-3 py-2.5 text-[0.86rem] text-white ring-1 ring-white/10 outline-none focus:ring-2 focus:ring-brand/70"
        />

        <div className="flex items-center gap-3">
          <input
            name="durationMinutes"
            type="number"
            min={0}
            step="0.1"
            defaultValue={10}
            className="h-10 w-28 rounded-lg bg-surface-1 px-3 text-[0.86rem] text-white ring-1 ring-white/10 outline-none focus:ring-2 focus:ring-brand/70"
          />
          <span className="text-[0.76rem] text-neutral-500">minutos</span>

          <label className="ml-auto flex cursor-pointer items-center gap-2 text-[0.8rem] text-neutral-300">
            <input
              type="checkbox"
              name="isFree"
              className="h-4 w-4 accent-[#E50914]"
            />
            Aula gratuita
          </label>
        </div>

        <FormMessage error={state?.error} />

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-lg px-3 py-2 text-[0.82rem] text-neutral-400 transition hover:bg-white/5 hover:text-white"
          >
            Cancelar
          </button>
          <SaveLessonButton />
        </div>
      </form>
    </div>
  );
}
