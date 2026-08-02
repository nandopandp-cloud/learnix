"use client";

import { useState } from "react";
import { Star } from "lucide-react";

import { cn } from "@/lib/utils";

const SIZES = {
  sm: "h-3.5 w-3.5",
  md: "h-4 w-4",
  lg: "h-7 w-7",
} as const;

/** Estrelas somente leitura — arredonda para a estrela cheia mais próxima. */
export function StarRating({
  value,
  size = "md",
  className,
}: {
  value: number;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  return (
    <span className={cn("flex gap-0.5", className)}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            SIZES[size],
            i < Math.round(value)
              ? "fill-amber-400 text-amber-400"
              : "text-neutral-700",
          )}
        />
      ))}
    </span>
  );
}

/** Estrelas clicáveis com preview no hover. */
export function StarRatingInput({
  value,
  onChange,
  size = "lg",
  disabled = false,
}: {
  value: number;
  onChange: (stars: number) => void;
  size?: keyof typeof SIZES;
  disabled?: boolean;
}) {
  const [hovered, setHovered] = useState(0);
  const shown = hovered || value;

  return (
    <span className="flex gap-1" onMouseLeave={() => setHovered(0)}>
      {Array.from({ length: 5 }).map((_, i) => {
        const stars = i + 1;
        return (
          <button
            key={stars}
            type="button"
            disabled={disabled}
            onClick={() => onChange(stars)}
            onMouseEnter={() => setHovered(stars)}
            aria-label={`${stars} ${stars === 1 ? "estrela" : "estrelas"}`}
            className="rounded transition-transform duration-200 hover:scale-115 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Star
              className={cn(
                SIZES[size],
                "transition-colors duration-200",
                stars <= shown
                  ? "fill-amber-400 text-amber-400"
                  : "text-neutral-700",
              )}
            />
          </button>
        );
      })}
    </span>
  );
}
