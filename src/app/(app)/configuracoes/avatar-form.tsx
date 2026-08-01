"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Check } from "lucide-react";

import { updateAvatar } from "@/app/(app)/actions";
import { FileUpload } from "@/components/ui/file-upload";

/**
 * Avatar do próprio perfil: qualquer usuário logado pode enviar (scope
 * "self-avatar"), diferente dos uploads de conteúdo da plataforma, que
 * exigem admin. Salva assim que uma nova URL aparece no campo oculto.
 */
export function AvatarForm({ defaultValue }: { defaultValue: string | null }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const lastSaved = useRef(defaultValue ?? "");

  const onChange = (url: string) => {
    if (url === lastSaved.current) return;
    lastSaved.current = url;
    setSaved(false);

    startTransition(async () => {
      const result = await updateAvatar(url);
      if (result.success) {
        setSaved(true);
        router.refresh();
      }
    });
  };

  return (
    <div className="flex items-center gap-2">
      <FileUpload
        label="Foto de perfil"
        kind="image"
        name="avatarUrl"
        variant="avatar"
        scope="self-avatar"
        defaultValue={defaultValue}
        hint="Enviar uma nova foto salva automaticamente."
        onValueChange={onChange}
      />
      {pending && <Loader2 className="h-4 w-4 shrink-0 animate-spin text-neutral-500" />}
      {saved && !pending && (
        <span className="flex shrink-0 items-center gap-1 text-[0.72rem] text-emerald-400">
          <Check className="h-3.5 w-3.5" />
          Salvo
        </span>
      )}
    </div>
  );
}
