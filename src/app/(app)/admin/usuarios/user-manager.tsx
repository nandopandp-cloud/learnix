"use client";

import { useActionState, useState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import Image from "next/image";
import { Plus, Trash2, Loader2, Crown, Shield } from "lucide-react";

import {
  createUser,
  deleteUser,
  updateUserFlags,
  type FormState,
} from "../actions";
import { cn, initials } from "@/lib/utils";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { FormMessage } from "@/components/ui/form-controls";

type Row = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  role: "student" | "admin";
  isPremium: boolean;
  createdAt: Date;
  enrollmentCount: number;
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex h-11 items-center gap-1.5 rounded-lg bg-brand px-4 text-[0.85rem] font-medium text-white transition hover:bg-brand-bright disabled:opacity-50"
    >
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Plus className="h-4 w-4" />
      )}
      Criar usuário
    </button>
  );
}

export function UserManager({
  users,
  currentUserId,
}: {
  users: Row[];
  currentUserId: string;
}) {
  const [state, formAction] = useActionState<FormState, FormData>(
    createUser,
    undefined,
  );

  return (
    <div className="space-y-4">
      <section className="rounded-xl bg-surface-1 p-5 ring-1 ring-white/[0.07]">
        <h2 className="mb-4 font-display text-[1.05rem] font-semibold text-white">
          Novo usuário
        </h2>

        <form action={formAction} className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              name="name"
              placeholder="Nome completo"
              required
              className="h-11 rounded-lg bg-surface-2 px-3.5 text-[0.88rem] text-white ring-1 ring-white/10 outline-none transition placeholder:text-neutral-600 focus:ring-2 focus:ring-brand/70"
            />
            <input
              name="email"
              type="email"
              placeholder="email@exemplo.com"
              required
              className="h-11 rounded-lg bg-surface-2 px-3.5 text-[0.88rem] text-white ring-1 ring-white/10 outline-none transition placeholder:text-neutral-600 focus:ring-2 focus:ring-brand/70"
            />
            <input
              name="password"
              type="password"
              placeholder="Senha (mín. 6 caracteres)"
              minLength={6}
              required
              className="h-11 rounded-lg bg-surface-2 px-3.5 text-[0.88rem] text-white ring-1 ring-white/10 outline-none transition placeholder:text-neutral-600 focus:ring-2 focus:ring-brand/70"
            />
            <select
              name="role"
              defaultValue="student"
              className="h-11 cursor-pointer rounded-lg bg-surface-2 px-3.5 text-[0.88rem] text-white ring-1 ring-white/10 outline-none transition focus:ring-2 focus:ring-brand/70"
            >
              <option value="student">Aluno</option>
              <option value="admin">Administrador</option>
            </select>
          </div>

          <label className="flex w-fit cursor-pointer items-center gap-2.5 text-[0.85rem] text-neutral-300">
            <input
              type="checkbox"
              name="isPremium"
              className="h-4 w-4 accent-[#E50914]"
            />
            Conta premium
          </label>

          <FormMessage error={state?.error} success={state?.success} />

          <div className="flex justify-end">
            <SubmitButton />
          </div>
        </form>
      </section>

      <ul className="space-y-2">
        {users.map((user) => (
          <UserRow
            key={user.id}
            user={user}
            isSelf={user.id === currentUserId}
          />
        ))}
      </ul>
    </div>
  );
}

function UserRow({ user, isSelf }: { user: Row; isSelf: boolean }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [role, setRole] = useState(user.role);
  const [premium, setPremium] = useState(user.isPremium);

  const update = (updates: {
    role?: "student" | "admin";
    isPremium?: boolean;
  }) => {
    if (updates.role) setRole(updates.role);
    if (updates.isPremium !== undefined) setPremium(updates.isPremium);
    startTransition(async () => {
      await updateUserFlags(user.id, updates);
    });
  };

  return (
    <li className="flex flex-wrap items-center gap-3.5 rounded-xl bg-surface-1 px-4 py-3.5 ring-1 ring-white/[0.07] transition hover:ring-white/15">
      <span className="relative block h-11 w-11 shrink-0 overflow-hidden rounded-full bg-surface-2 ring-1 ring-white/10">
        {user.avatarUrl ? (
          <Image
            src={user.avatarUrl}
            alt={user.name}
            fill
            sizes="44px"
            className="object-cover"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-[0.8rem] font-semibold text-white">
            {initials(user.name)}
          </span>
        )}
      </span>

      <span className="min-w-[10rem] flex-1">
        <span className="flex items-center gap-2">
          <span className="truncate text-[0.9rem] font-medium text-white">
            {user.name}
          </span>
          {isSelf && (
            <span className="shrink-0 rounded-full bg-white/10 px-2 py-0.5 text-[0.62rem] text-neutral-400">
              você
            </span>
          )}
        </span>
        <span className="block truncate text-[0.76rem] text-neutral-500">
          {user.email} · {user.enrollmentCount}{" "}
          {user.enrollmentCount === 1 ? "curso" : "cursos"}
        </span>
      </span>

      {/* Papel */}
      <button
        onClick={() =>
          update({ role: role === "admin" ? "student" : "admin" })
        }
        disabled={isSelf || pending}
        title={isSelf ? "Você não pode alterar seu próprio papel" : undefined}
        className={cn(
          "flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.7rem] transition disabled:opacity-50",
          role === "admin"
            ? "bg-indigo-500/15 text-indigo-300 hover:bg-indigo-500/25"
            : "bg-white/[0.07] text-neutral-400 hover:bg-white/[0.12]",
        )}
      >
        <Shield className="h-3 w-3" />
        {role === "admin" ? "Admin" : "Aluno"}
      </button>

      {/* Premium */}
      <button
        onClick={() => update({ isPremium: !premium })}
        disabled={pending}
        className={cn(
          "flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.7rem] transition disabled:opacity-50",
          premium
            ? "bg-brand/15 text-brand hover:bg-brand/25"
            : "bg-white/[0.07] text-neutral-400 hover:bg-white/[0.12]",
        )}
      >
        <Crown className="h-3 w-3" />
        {premium ? "Premium" : "Gratuito"}
      </button>

      <button
        onClick={() => setConfirmOpen(true)}
        disabled={isSelf}
        aria-label={`Excluir ${user.name}`}
        title={isSelf ? "Você não pode excluir a própria conta" : undefined}
        className="shrink-0 rounded-lg p-2 text-neutral-500 transition hover:bg-brand/10 hover:text-brand disabled:pointer-events-none disabled:opacity-30"
      >
        {pending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Trash2 className="h-4 w-4" />
        )}
      </button>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Excluir usuário"
        description={`A conta de ${user.name} (${user.email}) será removida junto com todo o progresso e matrículas.`}
        confirmLabel="Excluir usuário"
        onConfirm={() => {
          setConfirmOpen(false);
          startTransition(async () => {
            await deleteUser(user.id);
          });
        }}
      />
    </li>
  );
}
