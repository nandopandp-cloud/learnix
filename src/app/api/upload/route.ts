import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { UPLOAD_LIMITS, type UploadClientPayload } from "@/lib/uploads";

/**
 * Gera tokens de upload direto do navegador para o Vercel Blob.
 * O arquivo nunca passa pelo servidor Next — evita o limite de payload
 * de rotas serverless, essencial para vídeos de aula.
 */
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        const payload = JSON.parse(
          (clientPayload as string | null) ?? "{}",
        ) as Partial<UploadClientPayload>;
        const kind = payload.kind ?? "image";
        const scope = payload.scope ?? "admin";

        // Conteúdo da plataforma (cursos, aulas, instrutores) exige admin;
        // a foto do próprio perfil qualquer usuário autenticado pode enviar.
        if (scope !== "self-avatar" && user.role !== "admin") {
          throw new Error("Apenas administradores podem enviar arquivos.");
        }

        const limits = UPLOAD_LIMITS[kind];
        if (!limits) throw new Error("Tipo de upload inválido.");

        return {
          allowedContentTypes: limits.accept,
          maximumSizeInBytes: limits.maxBytes,
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({ userId: user.id, kind, scope, pathname }),
        };
      },
      onUploadCompleted: async () => {
        // Sem pós-processamento necessário — a URL pública já volta ao cliente.
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha no upload.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
