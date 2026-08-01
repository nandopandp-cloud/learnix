"use client";

import { useId, useRef, useState } from "react";
import { upload } from "@vercel/blob/client";
import {
  UploadCloud,
  Loader2,
  X,
  ImageIcon,
  Video as VideoIcon,
  AlertCircle,
  Link2,
} from "lucide-react";

import { cn } from "@/lib/utils";
import {
  UPLOAD_LIMITS,
  formatBytes,
  type UploadKind,
  type UploadScope,
} from "@/lib/uploads";

/**
 * Campo de mídia com duas entradas equivalentes: enviar um arquivo (upload
 * direto para o Vercel Blob) ou colar uma URL já existente. Mostra preview,
 * progresso e as regras de formato/tamanho aceitas.
 */
export function FileUpload({
  label,
  hint,
  kind,
  name,
  defaultValue,
  className,
  scope = "admin",
  variant = "default",
  onValueChange,
}: {
  label: string;
  hint?: string;
  kind: UploadKind;
  name: string;
  defaultValue?: string | null;
  className?: string;
  /** Quem tem permissão para gerar o token de upload no servidor. */
  scope?: UploadScope;
  /** "avatar" mostra o dropzone e o preview em um círculo compacto. */
  variant?: "default" | "avatar";
  /** Chamado sempre que a URL final muda — upload concluído, URL colada ou limpeza. */
  onValueChange?: (url: string) => void;
}) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [url, setUrlState] = useState(defaultValue ?? "");
  const setUrl = (value: string) => {
    setUrlState(value);
    onValueChange?.(value);
  };
  const [mode, setMode] = useState<"upload" | "url">(
    defaultValue ? "url" : "upload",
  );
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const limits = UPLOAD_LIMITS[kind];
  const Icon = kind === "video" ? VideoIcon : ImageIcon;

  const onPick = () => inputRef.current?.click();

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    setError(null);

    if (!limits.accept.includes(file.type)) {
      setError(`Formato não suportado. Aceitos: ${limits.label}.`);
      return;
    }
    if (file.size > limits.maxBytes) {
      setError(
        `Arquivo muito grande (${formatBytes(file.size)}). Máximo: ${formatBytes(limits.maxBytes)}.`,
      );
      return;
    }

    setFileName(file.name);
    setProgress(0);

    try {
      const blob = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/upload",
        clientPayload: JSON.stringify({ kind, scope }),
        onUploadProgress: (event) => setProgress(event.percentage),
      });
      setUrl(blob.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao enviar o arquivo.");
      setFileName(null);
    } finally {
      setProgress(null);
    }
  };

  const clear = () => {
    setUrl("");
    setFileName(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const modeToggle = (
    <div className="flex gap-1 rounded-md bg-surface-2 p-0.5 text-[0.68rem]">
      <button
        type="button"
        onClick={() => setMode("upload")}
        className={cn(
          "rounded px-2 py-1 transition",
          mode === "upload"
            ? "bg-brand text-white"
            : "text-neutral-400 hover:text-white",
        )}
      >
        Enviar arquivo
      </button>
      <button
        type="button"
        onClick={() => setMode("url")}
        className={cn(
          "rounded px-2 py-1 transition",
          mode === "url"
            ? "bg-brand text-white"
            : "text-neutral-400 hover:text-white",
        )}
      >
        Usar URL
      </button>
    </div>
  );

  if (variant === "avatar") {
    return (
      <div className={cn("space-y-2", className)}>
        <label htmlFor={id} className="block text-[0.8rem] text-neutral-300">
          {label}
        </label>

        {/* input real que viaja com o form — sempre a URL final, seja de upload ou colada */}
        <input type="hidden" name={name} value={url} readOnly />

        <div className="flex items-center gap-4">
          {mode === "upload" ? (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                void onFile(e.dataTransfer.files?.[0]);
              }}
              onClick={onPick}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && onPick()}
              className="group relative flex h-20 w-20 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-dashed border-white/15 bg-surface-1 transition-all duration-300 hover:border-brand/40 hover:bg-surface-2"
            >
              <input
                ref={inputRef}
                id={id}
                type="file"
                accept={limits.accept.join(",")}
                className="hidden"
                onChange={(e) => onFile(e.target.files?.[0])}
              />

              {url ? (
                <AvatarPreview url={url} onClear={clear} />
              ) : progress !== null ? (
                <Loader2 className="h-5 w-5 animate-spin text-brand" />
              ) : (
                <UploadCloud className="h-5 w-5 text-neutral-500 transition-colors group-hover:text-brand" />
              )}
            </div>
          ) : (
            <span className="relative block h-20 w-20 shrink-0 overflow-hidden rounded-full bg-surface-2 ring-1 ring-white/10">
              {url && (
                // eslint-disable-next-line @next/next/no-img-element -- URL externa arbitrária
                <img src={url} alt="" className="h-full w-full object-cover" />
              )}
            </span>
          )}

          <div className="min-w-0 flex-1 space-y-2">
            {modeToggle}
            {mode === "url" && (
              <div className="relative">
                <Link2 className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-neutral-600" />
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://…"
                  className="h-10 w-full rounded-lg bg-surface-1 pr-3.5 pl-10 text-[0.85rem] text-white ring-1 ring-white/10 outline-none transition-all duration-300 placeholder:text-neutral-600 hover:ring-white/20 focus:bg-surface-2 focus:ring-2 focus:ring-brand/70"
                />
              </div>
            )}
            {mode === "upload" && !url && (
              <p className="flex items-center gap-1.5 text-[0.7rem] text-neutral-600">
                <Icon className="h-3 w-3" />
                {limits.label}
              </p>
            )}
          </div>
        </div>

        {error && (
          <p className="flex items-center gap-1.5 text-[0.75rem] text-brand-bright">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            {error}
          </p>
        )}
        {hint && !error && (
          <p className="text-[0.72rem] text-neutral-600">{hint}</p>
        )}
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-baseline justify-between">
        <label htmlFor={id} className="block text-[0.8rem] text-neutral-300">
          {label}
        </label>
        {modeToggle}
      </div>

      {/* input real que viaja com o form — sempre a URL final, seja de upload ou colada */}
      <input type="hidden" name={name} value={url} readOnly />

      {mode === "url" ? (
        <div className="relative">
          <Link2 className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-neutral-600" />
          <input
            id={id}
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://…"
            className="h-11 w-full rounded-lg bg-surface-1 pr-3.5 pl-10 text-[0.88rem] text-white ring-1 ring-white/10 outline-none transition-all duration-300 placeholder:text-neutral-600 hover:ring-white/20 focus:bg-surface-2 focus:ring-2 focus:ring-brand/70"
          />
        </div>
      ) : (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            void onFile(e.dataTransfer.files?.[0]);
          }}
          onClick={onPick}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && onPick()}
          className={cn(
            "group relative flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-lg border border-dashed border-white/15 bg-surface-1 px-4 py-6 text-center transition-all duration-300 hover:border-brand/40 hover:bg-surface-2",
            url && "border-solid border-white/10 p-0",
          )}
        >
          <input
            ref={inputRef}
            id={id}
            type="file"
            accept={limits.accept.join(",")}
            className="hidden"
            onChange={(e) => onFile(e.target.files?.[0])}
          />

          {url ? (
            <MediaPreview url={url} kind={kind} onClear={clear} />
          ) : progress !== null ? (
            <div className="flex w-full flex-col items-center gap-2 py-2">
              <Loader2 className="h-6 w-6 animate-spin text-brand" />
              <p className="max-w-full truncate text-[0.78rem] text-neutral-400">
                Enviando {fileName}…
              </p>
              <div className="h-1.5 w-full max-w-[14rem] overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-brand transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ) : (
            <>
              <UploadCloud className="h-6 w-6 text-neutral-500 transition-colors group-hover:text-brand" />
              <p className="mt-2 text-[0.82rem] text-neutral-300">
                Clique ou arraste para enviar
              </p>
              <p className="mt-1 flex items-center gap-1.5 text-[0.7rem] text-neutral-600">
                <Icon className="h-3 w-3" />
                {limits.label}
              </p>
            </>
          )}
        </div>
      )}

      {error && (
        <p className="flex items-center gap-1.5 text-[0.75rem] text-brand-bright">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          {error}
        </p>
      )}
      {hint && !error && (
        <p className="text-[0.72rem] text-neutral-600">{hint}</p>
      )}
    </div>
  );
}

function MediaPreview({
  url,
  kind,
  onClear,
}: {
  url: string;
  kind: UploadKind;
  onClear: () => void;
}) {
  return (
    <div className="relative w-full">
      {kind === "image" ? (
        <div className="relative aspect-video w-full overflow-hidden bg-surface-2">
          {/* eslint-disable-next-line @next/next/no-img-element -- previews podem apontar para qualquer host externo */}
          <img src={url} alt="" className="h-full w-full object-cover" />
        </div>
      ) : (
        <video src={url} controls className="aspect-video w-full bg-black" />
      )}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onClear();
        }}
        aria-label="Remover mídia"
        className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-white backdrop-blur-sm transition hover:bg-brand"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function AvatarPreview({ url, onClear }: { url: string; onClear: () => void }) {
  return (
    <div className="group/avatar relative h-full w-full">
      {/* eslint-disable-next-line @next/next/no-img-element -- preview pode apontar para qualquer host externo */}
      <img src={url} alt="" className="h-full w-full object-cover" />
      <div className="absolute inset-0 flex items-center justify-center gap-1 bg-black/0 opacity-0 transition-all duration-200 group-hover/avatar:bg-black/50 group-hover/avatar:opacity-100">
        <UploadCloud className="h-4 w-4 text-white" />
      </div>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onClear();
        }}
        aria-label="Remover foto"
        className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/80 text-white ring-2 ring-void transition hover:bg-brand"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}
