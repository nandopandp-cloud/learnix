"use client";

import { useState } from "react";
import type { DocumentProps } from "@react-pdf/renderer";
import { Download, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { slugify } from "@/lib/utils";
import {
  CertificateDocument,
  type CertificateData,
} from "./certificate-document";

/** Gera o PDF no navegador (sem round-trip ao servidor) e dispara o download. */
export function DownloadCertificateButton({ data }: { data: CertificateData }) {
  const [pending, setPending] = useState(false);

  const onDownload = async () => {
    setPending(true);
    try {
      const [{ pdf }, React] = await Promise.all([
        import("@react-pdf/renderer"),
        import("react"),
      ]);

      // CertificateDocument sempre renderiza um único <Document> — o tipo do
      // wrapper não bate com DocumentProps porque expõe `data`, não as props
      // internas do react-pdf, mas a árvore real é compatível em runtime.
      const element = React.createElement(CertificateDocument, {
        data,
      }) as unknown as React.ReactElement<DocumentProps>;

      const blob = await pdf(element).toBlob();

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `certificado-${slugify(data.courseTitle)}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } finally {
      setPending(false);
    }
  };

  return (
    <Button size="sm" variant="outline" onClick={onDownload} disabled={pending}>
      {pending ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Download className="h-3.5 w-3.5" />
      )}
      Baixar PDF
    </Button>
  );
}
