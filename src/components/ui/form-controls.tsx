"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

const baseField =
  "w-full rounded-lg bg-surface-1 px-3.5 text-[0.88rem] text-white ring-1 ring-white/10 outline-none transition-all duration-300 placeholder:text-neutral-600 hover:ring-white/20 focus:bg-surface-2 focus:ring-2 focus:ring-brand/70";

export function TextInput({
  label,
  hint,
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
}) {
  const id = useId();
  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={id} className="block text-[0.8rem] text-neutral-300">
        {label}
      </label>
      <input id={id} className={cn(baseField, "h-11")} {...props} />
      {hint && <p className="text-[0.72rem] text-neutral-600">{hint}</p>}
    </div>
  );
}

export function TextArea({
  label,
  hint,
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  hint?: string;
}) {
  const id = useId();
  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={id} className="block text-[0.8rem] text-neutral-300">
        {label}
      </label>
      <textarea id={id} className={cn(baseField, "resize-y py-3")} {...props} />
      {hint && <p className="text-[0.72rem] text-neutral-600">{hint}</p>}
    </div>
  );
}

export function Select({
  label,
  className,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { label: string }) {
  const id = useId();
  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={id} className="block text-[0.8rem] text-neutral-300">
        {label}
      </label>
      <select id={id} className={cn(baseField, "h-11 cursor-pointer")} {...props}>
        {children}
      </select>
    </div>
  );
}

export function Checkbox({
  label,
  description,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  description?: string;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-lg px-1 py-2 transition hover:bg-white/[0.03]">
      <span className="relative mt-0.5 shrink-0">
        <input type="checkbox" className="peer sr-only" {...props} />
        <span className="block h-5 w-9 rounded-full bg-white/12 transition-colors duration-300 peer-checked:bg-brand" />
        <span className="absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white transition-transform duration-300 peer-checked:translate-x-4" />
      </span>
      <span className="min-w-0">
        <span className="block text-[0.85rem] text-white">{label}</span>
        {description && (
          <span className="mt-0.5 block text-[0.75rem] text-neutral-500">
            {description}
          </span>
        )}
      </span>
    </label>
  );
}

export function FormMessage({
  error,
  success,
}: {
  error?: string;
  success?: string;
}) {
  if (!error && !success) return null;

  return (
    <p
      role="status"
      className={cn(
        "rounded-lg px-3.5 py-2.5 text-[0.8rem] ring-1",
        error
          ? "bg-brand/10 text-brand-bright ring-brand/25"
          : "bg-emerald-500/10 text-emerald-400 ring-emerald-500/25",
      )}
    >
      {error ?? success}
    </p>
  );
}
