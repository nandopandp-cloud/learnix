"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

/** Diálogo de confirmação para ações destrutivas do admin. */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirmar",
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <button
        aria-label="Fechar"
        onClick={onClose}
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        style={{ animation: "fadeIn 0.2s ease-out both" }}
      />

      <div
        role="dialog"
        aria-modal="true"
        className="glass relative w-full max-w-md rounded-2xl p-6 ring-1 ring-white/12 shadow-2xl"
        style={{ animation: "animationIn 0.35s var(--ease-out-expo) both" }}
      >
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand/12 ring-1 ring-brand/25">
          <AlertTriangle className="h-5 w-5 text-brand" />
        </span>

        <h2 className="mt-4 font-display text-lg font-semibold text-white">
          {title}
        </h2>
        <p className="mt-2 text-[0.86rem] leading-relaxed text-neutral-400">
          {description}
        </p>

        <div className="mt-6 flex justify-end gap-2.5">
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2.5 text-[0.85rem] text-neutral-300 transition hover:bg-white/[0.07] hover:text-white"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="rounded-lg bg-brand px-4 py-2.5 text-[0.85rem] font-medium text-white transition hover:bg-brand-bright"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
