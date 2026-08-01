"use client";

import { useState, useTransition } from "react";
import { Plus, Check, Loader2 } from "lucide-react";

import { toggleWatchlist } from "@/app/(app)/actions";
import { Button } from "@/components/ui/button";

export function WatchlistButton({
  courseId,
  initialSaved,
  size = "lg",
}: {
  courseId: string;
  initialSaved: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const [saved, setSaved] = useState(initialSaved);
  const [pending, startTransition] = useTransition();

  const onClick = () => {
    // Atualização otimista: o estado volta atrás se a action divergir.
    setSaved((s) => !s);
    startTransition(async () => {
      const result = await toggleWatchlist(courseId);
      setSaved(result.saved);
    });
  };

  return (
    <Button variant="secondary" size={size} onClick={onClick} disabled={pending}>
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : saved ? (
        <Check className="h-4 w-4 text-brand" />
      ) : (
        <Plus className="h-4 w-4" />
      )}
      {saved ? "Na minha lista" : "Adicionar à minha lista"}
    </Button>
  );
}
