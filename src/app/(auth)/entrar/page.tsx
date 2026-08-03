import Link from "next/link";
import type { Metadata } from "next";
import { AuthShell } from "../auth-shell";
import { LoginForm } from "./login-form";

/**
 * O mosaico do fundo lê o catálogo publicado. Revalida de hora em hora para
 * refletir cursos novos sem abrir mão do HTML estático nesta rota pública.
 */
export const revalidate = 3600;

export const metadata: Metadata = { title: "Entrar" };

export default function EntrarPage() {
  return (
    <AuthShell
      eyebrow="Acesso"
      title={
        <>
          Bem-vindo de <span className="text-brand">volta</span>
        </>
      }
      subtitle="Entre para continuar de onde você parou."
      footer={
        <p className="text-sm text-neutral-500">
          Ainda não tem conta?{" "}
          <Link
            href="/criar-conta"
            className="font-medium text-white underline-offset-4 transition hover:text-brand hover:underline"
          >
            Criar conta
          </Link>
        </p>
      }
    >
      <LoginForm />
    </AuthShell>
  );
}
