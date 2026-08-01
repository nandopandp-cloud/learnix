/** Regras de upload compartilhadas entre a API, o admin e o componente de UI. */

export type UploadKind = "image" | "video";

export const UPLOAD_LIMITS: Record<
  UploadKind,
  { maxBytes: number; accept: string[]; label: string }
> = {
  image: {
    maxBytes: 8 * 1024 * 1024, // 8 MB
    accept: ["image/jpeg", "image/png", "image/webp", "image/gif"],
    label: "JPG, PNG, WEBP ou GIF — até 8 MB",
  },
  video: {
    maxBytes: 500 * 1024 * 1024, // 500 MB
    accept: ["video/mp4", "video/webm", "video/quicktime"],
    label: "MP4, WEBM ou MOV — até 500 MB",
  },
};

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let i = 0;
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024;
    i++;
  }
  return `${value.toFixed(value < 10 ? 1 : 0)} ${units[i]}`;
}
