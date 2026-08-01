import { cn } from "@/lib/utils";

/**
 * Marca da Learnix reconstruída em SVG a partir de assets/logo-learnix.png:
 * um "L" vermelho cujo braço interno vira um play triangle.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      aria-hidden="true"
      className={cn("h-8 w-8", className)}
    >
      <defs>
        <linearGradient id="lx-mark" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FF2A36" />
          <stop offset="100%" stopColor="#B20710" />
        </linearGradient>
      </defs>
      {/* haste + base do L */}
      <path
        d="M14 12h14a8 8 0 0 1 8 8v50h34a8 8 0 0 1 8 8v10H14V12Z"
        fill="url(#lx-mark)"
      />
      {/* play triangle */}
      <path d="M40 26 78 48 40 70V26Z" fill="url(#lx-mark)" />
    </svg>
  );
}

export function Logo({
  className,
  withTagline = false,
}: {
  className?: string;
  withTagline?: boolean;
}) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <LogoMark />
      <span className="flex flex-col leading-none">
        <span className="font-display text-[1.35rem] font-bold tracking-tight text-white">
          Learn<span className="text-brand">ix</span>
        </span>
        {withTagline && (
          <span className="mt-1 font-mono text-[0.5rem] tracking-[0.28em] text-neutral-500 uppercase">
            Aprenda. Assista. Evolua.
          </span>
        )}
      </span>
    </span>
  );
}
