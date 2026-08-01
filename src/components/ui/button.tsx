import { Slot } from "@/components/ui/slot";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "outline";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary:
    "bg-brand text-white hover:bg-brand-bright shadow-[0_8px_30px_-8px_rgb(229_9_20/0.6)]",
  secondary: "bg-white/10 text-white hover:bg-white/[0.16] backdrop-blur-sm",
  outline:
    "bg-transparent text-white ring-1 ring-white/15 hover:bg-white/[0.06] hover:ring-white/30",
  ghost: "bg-transparent text-neutral-300 hover:bg-white/[0.06] hover:text-white",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3.5 text-[0.8rem] gap-1.5",
  md: "h-11 px-5 text-sm gap-2",
  lg: "h-13 px-7 text-[0.95rem] gap-2.5",
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  asChild?: boolean;
  /** Feixe de brilho atravessando o botão no hover (padrão dos assets). */
  shimmer?: boolean;
}

export function Button({
  className,
  variant = "primary",
  size = "md",
  asChild = false,
  shimmer = false,
  children,
  ...props
}: ButtonProps) {
  const classes = cn(
    "group relative inline-flex items-center justify-center overflow-hidden rounded-lg font-medium",
    "transition-all duration-300 ease-[var(--ease-out-quint)]",
    "active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
    variants[variant],
    sizes[size],
    className,
  );

  const beam = shimmer ? (
    <span className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
      <span className="absolute top-0 left-0 h-full w-full bg-gradient-to-r from-transparent via-white/25 to-transparent opacity-0 group-hover:animate-shimmer group-hover:opacity-100" />
    </span>
  ) : null;

  // Com asChild o conteúdo precisa ir direto para o filho (ex.: um <Link>),
  // sem wrapper — o Slot aceita apenas um elemento.
  if (asChild) {
    return (
      <Slot className={classes} {...props}>
        {children}
      </Slot>
    );
  }

  return (
    <button className={classes} {...props}>
      {beam}
      <span className="relative z-10 inline-flex items-center gap-[inherit]">
        {children}
      </span>
    </button>
  );
}

/**
 * CTA com beam cônico girando na borda no hover — o efeito "Get Access"
 * do asset animations-gemini.
 */
export function BeamButton({
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "group relative inline-flex items-center justify-center overflow-hidden rounded-full p-[1px] leading-none",
        className,
      )}
      {...props}
    >
      <span className="absolute inset-[-1000%] animate-[spin_2.5s_linear_infinite] bg-[conic-gradient(from_0deg,transparent_0_320deg,#E50914_360deg)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      <span className="absolute inset-0 rounded-full bg-white/12 transition-opacity duration-500 group-hover:opacity-0" />
      <span className="relative flex h-full w-full items-center gap-2.5 rounded-full bg-surface-1 px-6 py-3 text-sm font-medium text-white ring-1 ring-white/10">
        {children}
      </span>
    </button>
  );
}
