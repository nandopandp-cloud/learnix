"use client";

import { useActionState, useState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import {
  Plus,
  Trash2,
  Loader2,
  Pencil,
  FileText,
  ExternalLink,
  Check,
} from "lucide-react";

import {
  createMaterial,
  updateMaterial,
  deleteMaterial,
  type FormState,
} from "../../actions";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { FormMessage } from "@/components/ui/form-controls";
import { FileUpload } from "@/components/ui/file-upload";
import { formatBytes } from "@/lib/uploads";
import type { Material, Lesson } from "@/db/schema";

export function MaterialsEditor({
  courseId,
  materials,
  lessons,
}: {
  courseId: string;
  materials: Material[];
  lessons: Lesson[];
}) {
  const [adding, setAdding] = useState(false);

  return (
    <section className="rounded-xl bg-surface-1 p-5 ring-1 ring-white/[0.07]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-[1.05rem] font-semibold text-white">
            Materiais de apoio
          </h2>
          <p className="mt-1 text-[0.78rem] text-neutral-500">
            {materials.length}{" "}
            {materials.length === 1 ? "material" : "materiais"} · PDFs,
            planilhas, resumos e links
          </p>
        </div>
      </div>

      {materials.length > 0 && (
        <ul className="mt-4 divide-y divide-white/[0.05] overflow-hidden rounded-lg ring-1 ring-white/[0.07]">
          {materials.map((material) => (
            <MaterialRow
              key={material.id}
              material={material}
              courseId={courseId}
              lessons={lessons}
            />
          ))}
        </ul>
      )}

      {materials.length === 0 && !adding && (
        <p className="mt-4 rounded-lg bg-surface-2/50 p-6 text-center text-[0.85rem] text-neutral-500">
          Nenhum material ainda. Adicione PDFs, planilhas ou links para os
          alunos baixarem.
        </p>
      )}

      {adding ? (
        <div className="mt-3 rounded-lg bg-surface-2/50 p-4">
          <MaterialForm
            courseId={courseId}
            lessons={lessons}
            onDone={() => setAdding(false)}
          />
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-white/10 py-3 text-[0.82rem] text-neutral-400 transition hover:border-brand/40 hover:text-white"
        >
          <Plus className="h-3.5 w-3.5" />
          Adicionar material
        </button>
      )}
    </section>
  );
}

function MaterialRow({
  material,
  courseId,
  lessons,
}: {
  material: Material;
  courseId: string;
  lessons: Lesson[];
}) {
  const [editing, setEditing] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const isLink = material.fileType === "link";
  const lesson = lessons.find((l) => l.id === material.lessonId);

  if (editing) {
    return (
      <li className="bg-surface-2/50 p-4">
        <MaterialForm
          courseId={courseId}
          lessons={lessons}
          material={material}
          onDone={() => setEditing(false)}
        />
      </li>
    );
  }

  return (
    <li className="group flex items-center gap-3 px-4 py-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand/10 ring-1 ring-brand/20">
        {isLink ? (
          <ExternalLink className="h-4 w-4 text-brand" />
        ) : (
          <FileText className="h-4 w-4 text-brand" />
        )}
      </span>

      <span className="min-w-0 flex-1">
        <span className="block truncate text-[0.88rem] text-white">
          {material.title}
        </span>
        <span className="text-[0.72rem] text-neutral-500">
          <span className="uppercase">{material.fileType}</span>
          {material.sizeLabel && ` · ${material.sizeLabel}`}
          {lesson ? ` · ${lesson.title}` : " · Curso inteiro"}
        </span>
      </span>

      <div className="flex shrink-0 gap-1 opacity-0 transition group-hover:opacity-100">
        <button
          onClick={() => setEditing(true)}
          aria-label="Editar material"
          className="flex h-7 w-7 items-center justify-center rounded-md text-neutral-500 transition hover:bg-white/5 hover:text-white"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => setConfirmOpen(true)}
          disabled={pending}
          aria-label="Excluir material"
          className="flex h-7 w-7 items-center justify-center rounded-md text-neutral-500 transition hover:bg-white/5 hover:text-brand"
        >
          {pending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Trash2 className="h-3.5 w-3.5" />
          )}
        </button>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Excluir material"
        description={`Isso remove “${material.title}” da lista de materiais do curso.`}
        confirmLabel="Excluir material"
        onConfirm={() => {
          setConfirmOpen(false);
          startTransition(async () => {
            await deleteMaterial(material.id, courseId);
          });
        }}
      />
    </li>
  );
}

function MaterialForm({
  courseId,
  lessons,
  material,
  onDone,
}: {
  courseId: string;
  lessons: Lesson[];
  material?: Material;
  onDone: () => void;
}) {
  const [state, formAction] = useActionState<FormState, FormData>(
    material ? updateMaterial : createMaterial,
    undefined,
  );

  const [isLink, setIsLink] = useState(material?.fileType === "link");
  const [sizeLabel, setSizeLabel] = useState(material?.sizeLabel ?? "");

  return (
    <form
      action={(fd) => {
        formAction(fd);
        onDone();
      }}
      className="space-y-3"
    >
      {material && <input type="hidden" name="id" value={material.id} />}
      <input type="hidden" name="courseId" value={courseId} />
      <input type="hidden" name="sizeLabel" value={sizeLabel} />

      <input
        name="title"
        defaultValue={material?.title}
        required
        autoFocus
        placeholder="Título do material (ex.: Planilha de controle)"
        className="h-10 w-full rounded-lg bg-surface-1 px-3 text-[0.85rem] text-white ring-1 ring-white/10 outline-none transition placeholder:text-neutral-600 focus:ring-2 focus:ring-brand/70"
      />

      {/* Alterna entre arquivo enviado e link externo */}
      <div className="flex gap-1 rounded-lg bg-surface-1 p-1">
        <button
          type="button"
          onClick={() => setIsLink(false)}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 text-[0.78rem] transition ${
            !isLink
              ? "bg-surface-2 text-white"
              : "text-neutral-500 hover:text-neutral-300"
          }`}
        >
          <FileText className="h-3.5 w-3.5" />
          Enviar arquivo
        </button>
        <button
          type="button"
          onClick={() => setIsLink(true)}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 text-[0.78rem] transition ${
            isLink
              ? "bg-surface-2 text-white"
              : "text-neutral-500 hover:text-neutral-300"
          }`}
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Link externo
        </button>
      </div>

      {isLink && <input type="hidden" name="isLink" value="on" />}

      {isLink ? (
        <input
          key="link"
          name="fileUrl"
          type="url"
          defaultValue={material?.fileType === "link" ? material.fileUrl : ""}
          required
          placeholder="https://drive.google.com/..."
          className="h-10 w-full rounded-lg bg-surface-1 px-3 text-[0.85rem] text-white ring-1 ring-white/10 outline-none transition placeholder:text-neutral-600 focus:ring-2 focus:ring-brand/70"
        />
      ) : (
        <FileUpload
          key="file"
          label="Arquivo"
          kind="document"
          name="fileUrl"
          defaultValue={material?.fileType === "link" ? null : material?.fileUrl}
          onFileMeta={(meta) => setSizeLabel(formatBytes(meta.size))}
        />
      )}

      <select
        name="lessonId"
        defaultValue={material?.lessonId ?? ""}
        className="h-10 w-full cursor-pointer rounded-lg bg-surface-1 px-3 text-[0.85rem] text-white ring-1 ring-white/10 outline-none transition focus:ring-2 focus:ring-brand/70"
      >
        <option value="">Curso inteiro (aparece em todas as aulas)</option>
        {lessons.map((lesson) => (
          <option key={lesson.id} value={lesson.id}>
            {lesson.title}
          </option>
        ))}
      </select>

      <FormMessage error={state?.error} />

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onDone}
          className="rounded-lg px-3 py-1.5 text-[0.8rem] text-neutral-400 transition hover:text-white"
        >
          Cancelar
        </button>
        <SaveButton editing={Boolean(material)} />
      </div>
    </form>
  );
}

function SaveButton({ editing }: { editing: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="flex items-center gap-1.5 rounded-lg bg-brand px-3.5 py-1.5 text-[0.8rem] font-medium text-white transition hover:bg-brand-bright disabled:opacity-50"
    >
      {pending ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Check className="h-3.5 w-3.5" />
      )}
      {editing ? "Salvar" : "Adicionar"}
    </button>
  );
}
