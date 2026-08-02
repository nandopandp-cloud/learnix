"use client";

import { useCallback, useState } from "react";
import Cropper, { type Area, type Point } from "react-easy-crop";
import { AlertCircle, Check, Loader2, X, ZoomIn } from "lucide-react";

import { cropImageToBlob } from "@/lib/image-crop";

/**
 * Modal de recorte: abre com a imagem recém-selecionada, deixa o usuário
 * ajustar zoom e posição dentro da proporção alvo (círculo para avatar,
 * retângulo para thumbnail/backdrop) e devolve o arquivo já recortado.
 */
export function ImageCropperModal({
  imageSrc,
  aspect,
  cropShape,
  mimeType,
  onCancel,
  onConfirm,
}: {
  imageSrc: string;
  aspect: number;
  cropShape: "round" | "rect";
  mimeType: string;
  onCancel: () => void;
  onConfirm: (blob: Blob) => void;
}) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [area, setArea] = useState<Area | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onCropComplete = useCallback((_: Area, croppedAreaPixels: Area) => {
    setArea(croppedAreaPixels);
  }, []);

  const confirm = async () => {
    if (!area) return;
    setProcessing(true);
    setError(null);
    try {
      const blob = await cropImageToBlob(imageSrc, area, mimeType);
      onConfirm(blob);
    } catch {
      // Tipicamente uma imagem de URL externa sem CORS liberado para leitura via canvas.
      setError(
        "Não foi possível recortar esta imagem — o site de origem não permite. Baixe e envie o arquivo diretamente.",
      );
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <button
        aria-label="Cancelar recorte"
        onClick={onCancel}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        style={{ animation: "fadeIn 0.2s ease-out both" }}
      />

      <div
        className="glass relative flex w-full max-w-lg flex-col overflow-hidden rounded-2xl ring-1 ring-white/12 shadow-2xl"
        style={{ animation: "animationIn 0.3s var(--ease-out-expo) both" }}
      >
        <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-4">
          <h2 className="font-display text-[1rem] font-semibold text-white">
            Ajustar recorte
          </h2>
          <button
            onClick={onCancel}
            aria-label="Fechar"
            className="rounded-lg p-1.5 text-neutral-500 transition hover:bg-white/[0.06] hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="relative h-80 bg-black sm:h-96">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            cropShape={cropShape}
            showGrid={cropShape === "rect"}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>

        <div className="space-y-4 px-5 py-4">
          <div className="flex items-center gap-3">
            <ZoomIn className="h-4 w-4 shrink-0 text-neutral-500" />
            <input
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              aria-label="Zoom"
              className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-[#E50914]"
            />
          </div>

          {error && (
            <p className="flex items-center gap-1.5 text-[0.78rem] text-brand-bright">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2.5">
            <button
              onClick={onCancel}
              className="rounded-lg px-4 py-2.5 text-[0.85rem] text-neutral-300 transition hover:bg-white/[0.07] hover:text-white"
            >
              Cancelar
            </button>
            <button
              onClick={confirm}
              disabled={processing || !area}
              className="flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2.5 text-[0.85rem] font-medium text-white transition hover:bg-brand-bright disabled:pointer-events-none disabled:opacity-50"
            >
              {processing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              Usar recorte
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
