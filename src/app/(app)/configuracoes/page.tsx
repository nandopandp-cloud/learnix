import type { Metadata } from "next";
import { Crown, Mail, Shield, User as UserIcon } from "lucide-react";

import { getCurrentUser } from "@/lib/auth";
import { PageHeader } from "@/components/app/page-header";
import { Reveal } from "@/components/ui/reveal";
import { Button } from "@/components/ui/button";
import { logoutAction } from "@/app/(auth)/actions";
import { AvatarForm } from "./avatar-form";

export const metadata: Metadata = { title: "Configurações" };

export default async function ConfiguracoesPage() {
  const user = (await getCurrentUser())!;

  return (
    <div>
      <PageHeader
        eyebrow="Conta"
        title="Configurações"
        description="Gerencie seus dados e preferências na Learnix."
      />

      <div className="max-w-2xl space-y-5 px-4 lg:px-8">
        <Reveal>
          <section className="rounded-2xl bg-surface-1 p-6 ring-1 ring-white/[0.07]">
            <h2 className="font-display text-[1.1rem] font-semibold text-white">
              Perfil
            </h2>

            <div className="mt-5 flex items-start gap-4">
              <AvatarForm defaultValue={user.avatarUrl} />

              <div className="min-w-0 pt-1">
                <p className="font-display text-lg font-semibold text-white">
                  {user.name}
                </p>
                <p className="truncate text-[0.85rem] text-neutral-500">
                  {user.email}
                </p>
              </div>
            </div>

            <dl className="mt-6 space-y-3 border-t border-white/[0.07] pt-5">
              <Row icon={UserIcon} label="Nome" value={user.name} />
              <Row icon={Mail} label="E-mail" value={user.email} />
              <Row
                icon={Shield}
                label="Tipo de conta"
                value={user.role === "admin" ? "Administrador" : "Aluno"}
              />
              <Row
                icon={Crown}
                label="Plano"
                value={user.isPremium ? "Premium" : "Gratuito"}
                highlight={user.isPremium}
              />
            </dl>
          </section>
        </Reveal>

        <Reveal delay={0.1}>
          <section className="rounded-2xl bg-surface-1 p-6 ring-1 ring-white/[0.07]">
            <h2 className="font-display text-[1.1rem] font-semibold text-white">
              Preferências
            </h2>
            <div className="mt-4 space-y-1">
              <Toggle
                label="Reprodução automática"
                description="Iniciar a próxima aula automaticamente ao terminar."
                defaultChecked
              />
              <Toggle
                label="Notificações por e-mail"
                description="Receber novidades sobre cursos e lançamentos."
                defaultChecked
              />
              <Toggle
                label="Legendas por padrão"
                description="Exibir legendas sempre que estiverem disponíveis."
              />
            </div>
          </section>
        </Reveal>

        <Reveal delay={0.2}>
          <section className="rounded-2xl bg-surface-1 p-6 ring-1 ring-white/[0.07]">
            <h2 className="font-display text-[1.1rem] font-semibold text-white">
              Sessão
            </h2>
            <p className="mt-2 text-[0.85rem] text-neutral-500">
              Encerrar a sessão neste dispositivo.
            </p>
            <form action={logoutAction} className="mt-4">
              <Button type="submit" variant="outline" size="sm">
                Sair da conta
              </Button>
            </form>
          </section>
        </Reveal>
      </div>
    </div>
  );
}

function Row({
  icon: Icon,
  label,
  value,
  highlight,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="flex items-center gap-2.5 text-[0.85rem] text-neutral-400">
        <Icon className="h-4 w-4 text-neutral-600" />
        {label}
      </dt>
      <dd
        className={
          highlight
            ? "text-[0.85rem] font-medium text-brand"
            : "truncate text-[0.85rem] text-neutral-200"
        }
      >
        {value}
      </dd>
    </div>
  );
}

/** Toggle estático — a persistência de preferências ainda não está ligada. */
function Toggle({
  label,
  description,
  defaultChecked,
}: {
  label: string;
  description: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 rounded-lg px-2 py-3 transition hover:bg-white/[0.03]">
      <span className="min-w-0">
        <span className="block text-[0.88rem] text-white">{label}</span>
        <span className="mt-0.5 block text-[0.78rem] text-neutral-500">
          {description}
        </span>
      </span>
      <span className="relative mt-1 shrink-0">
        <input
          type="checkbox"
          defaultChecked={defaultChecked}
          className="peer sr-only"
        />
        <span className="block h-6 w-11 rounded-full bg-white/12 transition-colors duration-300 peer-checked:bg-brand" />
        <span className="absolute top-1 left-1 h-4 w-4 rounded-full bg-white transition-transform duration-300 peer-checked:translate-x-5" />
      </span>
    </label>
  );
}
