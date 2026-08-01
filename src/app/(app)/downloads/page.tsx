import type { Metadata } from "next";
import Link from "next/link";
import { Download } from "lucide-react";

import { PageHeader, EmptyState } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Downloads" };

export default function DownloadsPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Offline"
        title="Downloads"
        description="Baixe aulas para assistir sem conexão."
      />

      <EmptyState
        icon={Download}
        title="Nenhum download disponível"
        description="O download de aulas para assistir offline chega em breve à Learnix. Enquanto isso, os materiais de apoio ficam disponíveis dentro de cada curso."
        action={
          <Button asChild variant="outline">
            <Link href="/cursos">Ver meus cursos</Link>
          </Button>
        }
      />
    </div>
  );
}
