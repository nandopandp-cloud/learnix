"use client";

import { useActionState, useState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import Image from "next/image";
import { Plus, Trash2, Loader2 } from "lucide-react";

import { createInstructor, deleteInstructor, type FormState } from "../actions";
import { initials } from "@/lib/utils";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { FormMessage } from "@/components/ui/form-controls";
import { FileUpload } from "@/components/ui/file-upload";

type Row = {
  id: string;
  name: string;
  title: string;
  bio: string | null;
  avatarUrl: string | null;
  courseCount: number;
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex h-11 items-center gap-1.5 rounded-lg bg-brand px-4 text-[0.85rem] font-medium text-white transition hover:bg-brand-bright disabled:opacity-50"
    >
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Plus className="h-4 w-4" />
      )}
      Criar instrutor
    </button>
  );
}

export function InstructorManager({ instructors }: { instructors: Row[] }) {
  const [state, formAction] = useActionState<FormState, FormData>(
    createInstructor,
    undefined,
  );

  return (
    <div className="space-y-4">
      <section className="rounded-xl bg-surface-1 p-5 ring-1 ring-white/[0.07]">
        <h2 className="mb-4 font-display text-[1.05rem] font-semibold text-white">
          Novo instrutor
        </h2>

        <form action={formAction} className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              name="name"
              placeholder="Nome completo"
              required
              className="h-11 rounded-lg bg-surface-2 px-3.5 text-[0.88rem] text-white ring-1 ring-white/10 outline-none transition placeholder:text-neutral-600 focus:ring-2 focus:ring-brand/70"
            />
            <input
              name="title"
              placeholder="Cargo (ex.: Designer de Produto)"
              className="h-11 rounded-lg bg-surface-2 px-3.5 text-[0.88rem] text-white ring-1 ring-white/10 outline-none transition placeholder:text-neutral-600 focus:ring-2 focus:ring-brand/70"
            />
            <FileUpload
              label="Avatar"
              kind="image"
              name="avatarUrl"
              className="sm:col-span-2"
            />
            <textarea
              name="bio"
              rows={3}
              placeholder="Biografia"
              className="resize-y rounded-lg bg-surface-2 px-3.5 py-2.5 text-[0.88rem] text-white ring-1 ring-white/10 outline-none transition placeholder:text-neutral-600 focus:ring-2 focus:ring-brand/70 sm:col-span-2"
            />
          </div>

          <FormMessage error={state?.error} success={state?.success} />

          <div className="flex justify-end">
            <SubmitButton />
          </div>
        </form>
      </section>

      <ul className="space-y-2">
        {instructors.map((inst) => (
          <InstructorRow key={inst.id} instructor={inst} />
        ))}
      </ul>
    </div>
  );
}

function InstructorRow({ instructor }: { instructor: Row }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <li className="flex items-center gap-3.5 rounded-xl bg-surface-1 px-4 py-3.5 ring-1 ring-white/[0.07] transition hover:ring-white/15">
      <span className="relative block h-11 w-11 shrink-0 overflow-hidden rounded-full bg-surface-2 ring-1 ring-white/10">
        {instructor.avatarUrl ? (
          <Image
            src={instructor.avatarUrl}
            alt={instructor.name}
            fill
            sizes="44px"
            className="object-cover"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-[0.8rem] font-semibold text-white">
            {initials(instructor.name)}
          </span>
        )}
      </span>

      <span className="min-w-0 flex-1">
        <span className="block truncate text-[0.9rem] font-medium text-white">
          {instructor.name}
        </span>
        <span className="block truncate text-[0.76rem] text-neutral-500">
          {instructor.title} · {instructor.courseCount}{" "}
          {instructor.courseCount === 1 ? "curso" : "cursos"}
        </span>
      </span>

      <button
        onClick={() => setConfirmOpen(true)}
        aria-label={`Excluir ${instructor.name}`}
        className="shrink-0 rounded-lg p-2 text-neutral-500 transition hover:bg-brand/10 hover:text-brand"
      >
        {pending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Trash2 className="h-4 w-4" />
        )}
      </button>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Excluir instrutor"
        description={`“${instructor.name}” será removido. Os ${instructor.courseCount} cursos vinculados ficarão sem instrutor.`}
        confirmLabel="Excluir instrutor"
        onConfirm={() => {
          setConfirmOpen(false);
          startTransition(async () => {
            await deleteInstructor(instructor.id);
          });
        }}
      />
    </li>
  );
}
