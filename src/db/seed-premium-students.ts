/**
 * Cria (ou atualiza) os alunos premium "pagantes" da Learnix.
 *
 * Diferente do `db:seed`, este script NÃO limpa o catálogo: apenas garante
 * que cada usuário da lista exista com o perfil de aluno premium. É
 * idempotente — rodar de novo só re-hasheia a senha e reafirma o perfil.
 *
 *   npm run db:seed:premium
 */
import { config } from "dotenv";
config({ path: ".env.local", quiet: true });

import bcrypt from "bcryptjs";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import * as schema from "./schema";
import { users } from "./schema";

const db = drizzle(neon(process.env.DATABASE_URL!), { schema });

/** Senha combinada para todos os acessos criados por este script. */
const PASSWORD = "123456";

/** Deriva "lucas.rufino" → "Lucas Rufino" a partir do e-mail. */
const nameFromEmail = (email: string) =>
  email
    .split("@")[0]
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const PREMIUM_STUDENTS = [
  "lucas.rufino@jovensgenios.com",
  "bruno.tamburro@jovensgenios.com",
  "fernanda.silva@jovensgenios.com",
];

async function main() {
  const passwordHash = await bcrypt.hash(PASSWORD, 10);

  console.log("→ Criando/atualizando alunos premium…");

  for (const rawEmail of PREMIUM_STUDENTS) {
    const email = rawEmail.trim().toLowerCase();
    const name = nameFromEmail(email);

    await db
      .insert(users)
      .values({
        name,
        email,
        passwordHash,
        role: "student",
        isPremium: true,
      })
      // Se o e-mail já existir, garante o perfil premium e reafirma a senha.
      .onConflictDoUpdate({
        target: users.email,
        set: {
          name,
          passwordHash,
          role: "student",
          isPremium: true,
        },
      });

    console.log(`  ✓ ${name} <${email}> — aluno premium`);
  }

  console.log(`
✓ Concluído — ${PREMIUM_STUDENTS.length} alunos premium prontos.

  Senha para todos: ${PASSWORD}
`);
}

main().catch((err) => {
  console.error("Falha ao criar alunos premium:", err);
  process.exit(1);
});
