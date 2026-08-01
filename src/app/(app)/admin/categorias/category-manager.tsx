"use client";

import { useActionState, useState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import * as Icons from "lucide-react";
import { Plus, Trash2, Loader2 } from "lucide-react";

import { createCategory, deleteCategory, type FormState } from "../actions";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { FormMessage } from "@/components/ui/form-controls";

type Row = {
  id: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
  courseCount: number;
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex h-11 shrink-0 items-center gap-1.5 rounded-lg bg-brand px-4 text-[0.85rem] font-medium text-white transition hover:bg-brand-bright disabled:opacity-50"
    >
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Plus className="h-4 w-4" />
      )}
      Criar
    </button>
  );
}

export function CategoryManager({ categories }: { categories: Row[] }) {
  const [state, formAction] = useActionState<FormState, FormData>(
    createCategory,
    undefined,
  );

  return (
    <div className="space-y-4">
      <section className="rounded-xl bg-surface-1 p-5 ring-1 ring-white/[0.07]">
        <h2 className="mb-4 font-display text-[1.05rem] font-semibold text-white">
          Nova categoria
        </h2>

        <form action={formAction} className="space-y-3">
          <div className="flex flex-wrap gap-3">
            <input
              name="name"
              placeholder="Nome da categoria"
              required
              className="h-11 min-w-[12rem] flex-1 rounded-lg bg-surface-2 px-3.5 text-[0.88rem] text-white ring-1 ring-white/10 outline-none transition placeholder:text-neutral-600 focus:ring-2 focus:ring-brand/70"
            />
            <input
              name="icon"
              placeholder="Ícone (ex.: code-xml)"
              defaultValue="shapes"
              className="h-11 w-44 rounded-lg bg-surface-2 px-3.5 text-[0.88rem] text-white ring-1 ring-white/10 outline-none transition placeholder:text-neutral-600 focus:ring-2 focus:ring-brand/70"
            />
            <input
              name="color"
              type="color"
              defaultValue="#E50914"
              aria-label="Cor da categoria"
              className="h-11 w-16 cursor-pointer rounded-lg bg-surface-2 p-1 ring-1 ring-white/10"
            />
            <SubmitButton />
          </div>
          <p className="text-[0.72rem] text-neutral-600">
            Nomes de ícone seguem a biblioteca Lucide, em kebab-case.
          </p>
          <FormMessage error={state?.error} success={state?.success} />
        </form>
      </section>

      <ul className="space-y-2">
        {categories.map((cat) => (
          <CategoryRow key={cat.id} category={cat} />
        ))}
      </ul>
    </div>
  );
}

function CategoryRow({ category }: { category: Row }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const Icon =
    (Icons[pascal(category.icon) as keyof typeof Icons] as React.ElementType) ??
    Icons.Shapes;

  return (
    <li className="flex items-center gap-3.5 rounded-xl bg-surface-1 px-4 py-3.5 ring-1 ring-white/[0.07] transition hover:ring-white/15">
      <span
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
        style={{ backgroundColor: `${category.color}1a` }}
      >
        <Icon className="h-5 w-5" style={{ color: category.color }} />
      </span>

      <span className="min-w-0 flex-1">
        <span className="block truncate text-[0.9rem] font-medium text-white">
          {category.name}
        </span>
        <span className="font-mono text-[0.72rem] text-neutral-600">
          /{category.slug} · {category.courseCount}{" "}
          {category.courseCount === 1 ? "curso" : "cursos"}
        </span>
      </span>

      <button
        onClick={() => setConfirmOpen(true)}
        aria-label={`Excluir ${category.name}`}
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
        title="Excluir categoria"
        description={`“${category.name}” será removida. Os ${category.courseCount} cursos vinculados ficarão sem categoria.`}
        confirmLabel="Excluir categoria"
        onConfirm={() => {
          setConfirmOpen(false);
          startTransition(async () => {
            await deleteCategory(category.id);
          });
        }}
      />
    </li>
  );
}

function pascal(name: string) {
  return name
    .split("-")
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join("");
}
