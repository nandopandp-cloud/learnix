"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Check, Pencil } from "lucide-react";

import { updateName } from "@/app/(app)/actions";

/** Nome de exibição do próprio perfil, editável inline. */
export function NameForm({ defaultValue }: { defaultValue: string }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(defaultValue);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  const cancel = () => {
    setValue(defaultValue);
    setError(null);
    setEditing(false);
  };

  const submit = () => {
    const trimmed = value.trim();
    if (trimmed === defaultValue) {
      setEditing(false);
      return;
    }

    setError(null);
    startTransition(async () => {
      const result = await updateName(trimmed);
      if (result.error) {
        setError(result.error);
        return;
      }
      setValue(result.name ?? trimmed);
      setEditing(false);
      setSaved(true);
      router.refresh();
    });
  };

  if (!editing) {
    return (
      <div className="flex items-center gap-2">
        <p className="font-display text-lg font-semibold text-white">
          {defaultValue}
        </p>
        <button
          onClick={() => setEditing(true)}
          aria-label="Editar nome"
          className="rounded-md p-1.5 text-neutral-500 transition hover:bg-white/5 hover:text-white"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
        {saved && (
          <span className="flex items-center gap-1 text-[0.72rem] text-emerald-400">
            <Check className="h-3.5 w-3.5" />
            Salvo
          </span>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
            if (e.key === "Escape") cancel();
          }}
          disabled={pending}
          autoFocus
          maxLength={60}
          aria-label="Nome"
          className="h-9 w-full max-w-[16rem] rounded-lg bg-surface-2 px-3 text-[0.9rem] text-white ring-1 ring-white/10 outline-none transition focus:ring-2 focus:ring-brand/70 disabled:opacity-50"
        />
        <button
          onClick={submit}
          disabled={pending || !value.trim()}
          className="flex h-9 items-center gap-1.5 rounded-lg bg-brand px-3 text-[0.8rem] font-medium text-white transition hover:bg-brand-bright disabled:pointer-events-none disabled:opacity-40"
        >
          {pending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Check className="h-3.5 w-3.5" />
          )}
          Salvar
        </button>
        <button
          onClick={cancel}
          disabled={pending}
          className="rounded-lg px-2.5 py-1.5 text-[0.8rem] text-neutral-400 transition hover:text-white disabled:opacity-50"
        >
          Cancelar
        </button>
      </div>
      {error && <p className="mt-2 text-[0.78rem] text-brand-bright">{error}</p>}
    </div>
  );
}
