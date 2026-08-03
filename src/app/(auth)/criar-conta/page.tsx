import Link from "next/link";
import type { Metadata } from "next";
import { AuthShell } from "../auth-shell";
import { RegisterForm } from "./register-form";

/**
 * O mosaico do fundo lê o catálogo publicado. Revalida de hora em hora para
 * refletir cursos novos sem abrir mão do HTML estático nesta rota pública.
 */
export const revalidate = 3600;

export const metadata: Metadata = { title: "Criar conta" };

export default function CriarContaPage() {
  return (
    <AuthShell
      eyebrow="Nova conta"
      title={
        <>
          Comece a <span className="text-brand">aprender</span>
        </>
      }
      subtitle="Crie sua conta gratuita e acesse o catálogo da Learnix."
      footer={
        <p className="text-sm text-neutral-500">
          Já tem conta?{" "}
          <Link
            href="/entrar"
            className="font-medium text-white underline-offset-4 transition hover:text-brand hover:underline"
          >
            Entrar
          </Link>
        </p>
      }
    >
      <RegisterForm />
    </AuthShell>
  );
}
