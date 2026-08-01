"use client";

import { useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

export function Field({
  label,
  type = "text",
  className,
  hint,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: React.ReactNode;
}) {
  const id = useId();
  const [visible, setVisible] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword && visible ? "text" : type;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-baseline justify-between">
        <label
          htmlFor={id}
          className="text-[0.8rem] font-medium text-neutral-300"
        >
          {label}
        </label>
        {hint}
      </div>
      <div className="relative">
        <input
          id={id}
          type={inputType}
          className={cn(
            "h-12 w-full rounded-xl bg-surface-1 px-4 text-sm text-white",
            "ring-1 ring-white/10 transition-all duration-300 outline-none",
            "placeholder:text-neutral-600",
            "hover:ring-white/20 focus:bg-surface-2 focus:ring-2 focus:ring-brand/70",
            isPassword && "pr-12",
          )}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
            className="absolute top-1/2 right-3 -translate-y-1/2 rounded-md p-1.5 text-neutral-500 transition hover:text-white"
          >
            {visible ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}
