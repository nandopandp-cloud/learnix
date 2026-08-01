"use client";

import { useState, useTransition } from "react";
import { Trash2, Loader2 } from "lucide-react";

import { deleteCourse } from "../actions";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export function DeleteCourseButton({
  courseId,
  title,
}: {
  courseId: string;
  title: string;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label={`Excluir ${title}`}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-neutral-500 transition hover:bg-brand/10 hover:text-brand"
      >
        {pending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Trash2 className="h-4 w-4" />
        )}
      </button>

      <ConfirmDialog
        open={open}
        onClose={() => setOpen(false)}
        title="Excluir curso"
        description={`Isso remove “${title}” e todos os seus módulos, aulas e progresso dos alunos. Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir curso"
        onConfirm={() => {
          setOpen(false);
          startTransition(async () => {
            await deleteCourse(courseId);
          });
        }}
      />
    </>
  );
}
