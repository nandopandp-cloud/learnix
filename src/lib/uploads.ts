/** Regras de upload compartilhadas entre a API, o admin e o componente de UI. */

export type UploadKind = "image" | "video" | "document";

/**
 * Quem pode gerar o token de upload:
 * - "admin": conteúdo da plataforma (cursos, aulas, instrutores) — só admins.
 * - "self-avatar": foto do próprio perfil — qualquer usuário autenticado.
 */
export type UploadScope = "admin" | "self-avatar";

export type UploadClientPayload = {
  kind: UploadKind;
  scope: UploadScope;
};

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
  document: {
    maxBytes: 50 * 1024 * 1024, // 50 MB
    accept: [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "text/plain",
      "text/csv",
      "application/zip",
      "application/x-zip-compressed",
    ],
    label: "PDF, Word, Excel, PowerPoint, TXT, CSV ou ZIP — até 50 MB",
  },
};

/** Extensão exibida ao aluno, derivada da URL do arquivo. */
export function fileTypeFromUrl(url: string) {
  const clean = url.split("?")[0].split("#")[0];
  const ext = clean.split(".").pop()?.toLowerCase();
  return ext && ext.length <= 5 && /^[a-z0-9]+$/.test(ext) ? ext : "arquivo";
}

/** Proporções (largura/altura) usadas no recorte de imagem em cada contexto. */
export const CROP_ASPECT = {
  /** Avatar de usuário/instrutor — sempre quadrado. */
  avatar: 1,
  /** Thumbnail de curso/aula — cards 16:9. */
  thumbnail: 16 / 9,
  /** Backdrop/capa — banner largo do topo da página. */
  backdrop: 21 / 9,
} as const;

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
