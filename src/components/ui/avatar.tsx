import Image from "next/image";

import { cn } from "@/lib/utils";

/** Foto do usuário, com as iniciais como fallback quando não há imagem. */
export function Avatar({
  name,
  src,
  className,
}: {
  name: string;
  src?: string | null;
  className?: string;
}) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <span
      className={cn(
        "relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface-2 ring-1 ring-white/10",
        className,
      )}
    >
      {src ? (
        <Image src={src} alt={name} fill className="object-cover" sizes="36px" />
      ) : (
        <span className="text-[0.7rem] font-semibold text-neutral-400">
          {initials}
        </span>
      )}
    </span>
  );
}
