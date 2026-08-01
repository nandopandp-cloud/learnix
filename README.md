# Learnix

Plataforma de cursos e vídeo-aulas com navegação estilo Netflix — catálogo em
fileiras horizontais, player próprio com retomada automática e painel
administrativo completo.

> **Aprenda. Assista. Evolua.**

## Stack

| Camada    | Tecnologia                                     |
| --------- | ---------------------------------------------- |
| Framework | Next.js 16 (App Router, Server Actions)        |
| Linguagem | TypeScript                                     |
| Estilo    | Tailwind CSS v4 (design tokens em `@theme`)    |
| Banco     | Neon (PostgreSQL serverless)                   |
| ORM       | Drizzle                                        |
| Auth      | Sessão própria — cookie httpOnly + bcrypt      |
| Ícones    | lucide-react                                   |
| Deploy    | Vercel                                         |

## Como rodar

```bash
npm install
cp .env.example .env.local   # preencha DATABASE_URL e AUTH_SECRET
npm run db:push              # cria as tabelas no Neon
npm run db:seed              # popula catálogo e usuários de teste
npm run dev
```

### Acessos de teste

| Perfil | E-mail                | Senha        |
| ------ | --------------------- | ------------ |
| Aluno  | `aluno@learnix.com`   | `learnix123` |
| Admin  | `admin@learnix.com`   | `admin123`   |

O aluno já vem com progresso em 5 cursos, para a home nascer preenchida.

## Scripts

| Comando             | O que faz                                   |
| ------------------- | ------------------------------------------- |
| `npm run dev`       | Servidor de desenvolvimento                 |
| `npm run build`     | Build de produção                           |
| `npm run lint`      | ESLint                                      |
| `npm run db:push`   | Aplica o schema no banco                    |
| `npm run db:seed`   | Recria o catálogo e os usuários de exemplo  |
| `npm run db:studio` | Drizzle Studio para inspecionar os dados    |

## Estrutura

```
src/
├── app/
│   ├── (auth)/            entrar, criar-conta e as actions de sessão
│   ├── (app)/             área logada — layout com sidebar + topbar
│   │   ├── inicio/        dashboard com as fileiras do catálogo
│   │   ├── explorar/      catálogo com filtros por categoria e nível
│   │   ├── cursos/[slug]/ overview do curso (tabs, instrutor, currículo)
│   │   ├── assistir/      player + playlist + anotações
│   │   ├── admin/         CRUD de cursos, módulos, aulas, usuários…
│   │   └── actions.ts     progresso, watchlist e anotações
│   └── api/search/        busca instantânea da topbar
├── components/
│   ├── ui/                primitivos (button, reveal, flashlight, slot…)
│   ├── app/               shell (sidebar, topbar, busca, menu do usuário)
│   ├── course/            cards, fileira horizontal, tabs, currículo
│   └── player/            player HTML5, playlist, painel da aula
├── db/                    schema Drizzle e seed
├── lib/                   auth, queries e utilitários
└── proxy.ts               proteção de rotas
```

## Design system

A linguagem visual foi extraída dos arquivos de referência em `assets/` e
centralizada em `src/app/globals.css`:

- **Paleta** — base monocromática quase preta (`#050505` → `#1E1E23`) com o
  vermelho da marca (`#E50914`) como único acento.
- **Entrada padrão** (`animationIn`) — sobe, revela e sai do blur, disparada por
  `IntersectionObserver` apenas quando o elemento entra na viewport
  (`<Reveal delay={…}>` escalona os irmãos).
- **Flashlight** — gradiente radial que acompanha o cursor nos cards.
- **Beam** — `conic-gradient` girando na borda de CTAs no hover.
- **Vidro fosco** (`.glass`), **borda em gradiente** via `mask-composite` e
  **máscara alfa** nas laterais dos carrosséis.
- `prefers-reduced-motion` desliga todas as animações.

## Modelo de dados

`users` · `sessions` · `instructors` · `categories` · `courses` · `modules` ·
`lessons` · `materials` · `enrollments` · `lesson_progress` · `watchlist` ·
`notes`

O progresso é gravado por aula (`position_seconds` + `completed`), com índice
único por `(user_id, lesson_id)` — o player faz upsert a cada 10 s e ao sair da
página, então nunca duplica linha.

## Player

Construído sobre `<video>`, sem dependências externas:

- Retoma de onde parou e conclui a aula automaticamente aos 92%
- Velocidade (0,5x–2x), volume, legendas, PiP e tela cheia
- Atalhos: `espaço`/`K` play, `←`/`→` ±10 s, `↑`/`↓` volume, `M` mudo, `F` fullscreen
- Anotações ancoradas no timestamp — clicar salta para o momento

## Deploy na Vercel

1. Importe o repositório na Vercel.
2. Defina as variáveis `DATABASE_URL` e `AUTH_SECRET`.
3. Deploy. O schema já vive no Neon; rode `npm run db:seed` localmente se quiser
   repovoar o catálogo.

Gere um segredo de produção com:

```bash
openssl rand -base64 32
```

## Notas

- Os vídeos do seed apontam para o bucket público de amostras do Google. Troque
  `video_url` pelas suas URLs (MP4 ou HLS) — o player aceita ambos.
- Aulas marcadas como `is_free` ficam abertas mesmo sem assinatura.
- `assets/` guarda apenas o material de referência de design e fica fora do lint.
