import type { Area } from "react-easy-crop";

/** Carrega uma imagem (URL local ou remota) como elemento pronto para desenhar em canvas. */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Recorta `imageSrc` na área selecionada (em pixels da imagem original,
 * como retornado pelo onCropComplete do react-easy-crop) e devolve um Blob
 * já no formato final, pronto para upload.
 */
export async function cropImageToBlob(
  imageSrc: string,
  area: Area,
  mimeType: string,
): Promise<Blob> {
  const image = await loadImage(imageSrc);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(area.width);
  canvas.height = Math.round(area.height);

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas não suportado neste navegador.");

  ctx.drawImage(
    image,
    area.x,
    area.y,
    area.width,
    area.height,
    0,
    0,
    canvas.width,
    canvas.height,
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Falha ao gerar imagem."))),
      mimeType,
      0.92,
    );
  });
}
