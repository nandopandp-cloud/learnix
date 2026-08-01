"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { users } from "@/db/schema";
import {
  authenticate,
  createSession,
  destroySession,
  hashPassword,
} from "@/lib/auth";

export type AuthState = { error?: string } | undefined;

export async function loginAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Informe e-mail e senha." };
  }

  const user = await authenticate(email, password);
  if (!user) {
    return { error: "E-mail ou senha incorretos." };
  }

  await createSession(user.id);
  redirect("/inicio");
}

export async function registerAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (name.length < 2) return { error: "Informe seu nome completo." };
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))
    return { error: "Informe um e-mail válido." };
  if (password.length < 6)
    return { error: "A senha precisa ter ao menos 6 caracteres." };

  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existing.length) {
    return { error: "Já existe uma conta com este e-mail." };
  }

  const [created] = await db
    .insert(users)
    .values({ name, email, passwordHash: await hashPassword(password) })
    .returning({ id: users.id });

  await createSession(created.id);
  redirect("/inicio");
}

export async function logoutAction() {
  await destroySession();
  redirect("/entrar");
}
