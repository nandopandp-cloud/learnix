/**
 * Popula o Neon com o catálogo inicial da Learnix.
 * Idempotente: limpa as tabelas de conteúdo e regrava tudo.
 *
 *   npm run db:seed
 */
import { config } from "dotenv";
config({ path: ".env.local", quiet: true });

import bcrypt from "bcryptjs";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq, sql as raw } from "drizzle-orm";

import * as schema from "./schema";
import {
  users,
  categories,
  instructors,
  courses,
  modules,
  lessons,
  materials,
  enrollments,
  lessonProgress,
  watchlist,
} from "./schema";

const db = drizzle(neon(process.env.DATABASE_URL!), { schema });

/** Vídeos livres de demonstração (Google sample bucket). */
const VIDEOS = [
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4",
];

const img = (id: string, w = 800) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

const avatar = (n: number, women = false) =>
  `https://randomuser.me/api/portraits/${women ? "women" : "men"}/${n}.jpg`;

const CATEGORIES = [
  { name: "Desenvolvimento", slug: "desenvolvimento", icon: "code-xml", color: "#6366F1" },
  { name: "Design", slug: "design", icon: "palette", color: "#EC4899" },
  { name: "Marketing", slug: "marketing", icon: "megaphone", color: "#22C55E" },
  { name: "Negócios", slug: "negocios", icon: "briefcase", color: "#F97316" },
  { name: "Produtividade", slug: "produtividade", icon: "bar-chart-3", color: "#38BDF8" },
  { name: "Fotografia", slug: "fotografia", icon: "camera", color: "#EAB308" },
];

const INSTRUCTORS = [
  {
    name: "Lucas Martins",
    title: "Designer de Produto",
    bio: "Especialista em Design Systems e Design de Produto com mais de 10 anos de experiência. Já formou mais de 50 mil alunos em todo o Brasil.",
    avatarUrl: avatar(32),
  },
  {
    name: "Ana Beatriz",
    title: "Engenheira de Software",
    bio: "Full-stack há 12 anos, com passagens por startups e big techs. Apaixonada por ensinar JavaScript e arquitetura de front-end.",
    avatarUrl: avatar(44, true),
  },
  {
    name: "Rafael Souza",
    title: "Head de Growth",
    bio: "Construiu operações de marketing digital que escalaram de zero a 7 dígitos. Foco em aquisição, dados e performance.",
    avatarUrl: avatar(15),
  },
  {
    name: "Carla Nogueira",
    title: "Diretora de Fotografia",
    bio: "Fotógrafa e videomaker premiada, com trabalhos publicados em veículos nacionais e internacionais.",
    avatarUrl: avatar(68, true),
  },
];

type LessonSeed = { title: string; duration: number; free?: boolean };
type ModuleSeed = { title: string; lessons: LessonSeed[] };

type CourseSeed = {
  title: string;
  slug: string;
  tagline: string;
  description: string;
  thumb: string;
  backdrop: string;
  category: string;
  instructor: string;
  level: string;
  rating: number;
  ratingCount: number;
  isPremium?: boolean;
  isNew?: boolean;
  learningPoints: string[];
  resourceCount: number;
  updatedLabel: string;
  modules: ModuleSeed[];
};

/** Gera módulos rapidamente a partir de pares [título, [aulas]]. */
const mod = (title: string, lessons: [string, number][]): ModuleSeed => ({
  title,
  lessons: lessons.map(([t, d]) => ({ title: t, duration: d })),
});

const COURSES: CourseSeed[] = [
  {
    title: "Design System na Prática",
    slug: "design-system-na-pratica",
    tagline:
      "Aprenda a criar sistemas de design escaláveis e consistentes do zero ao avançado.",
    description:
      "Neste curso completo, você vai aprender a construir um Design System do zero, criando componentes reutilizáveis, definindo padrões visuais e garantindo consistência em produtos digitais. Do básico ao avançado, na prática.",
    thumb: img("photo-1541462608143-67571c6738dd"),
    backdrop: img("photo-1587440871875-191322ee64b0", 1600),
    category: "design",
    instructor: "Lucas Martins",
    level: "Iniciante ao Avançado",
    rating: 4.9,
    ratingCount: 1245,
    learningPoints: [
      "Criar componentes reutilizáveis",
      "Documentar e organizar seu design system",
      "Estabelecer padrões de cores e tipografia",
      "Garantir acessibilidade e responsividade",
      "Usar grids e layouts de forma eficiente",
      "Integrar o design system ao desenvolvimento",
    ],
    resourceCount: 12,
    updatedLabel: "Abril/2024",
    modules: [
      mod("Introdução", [
        ["O que é um Design System", 744],
        ["Por que sua equipe precisa de um", 512],
        ["Como este curso funciona", 388],
      ]),
      mod("Fundamentos do Design", [
        ["Princípios visuais essenciais", 940],
        ["Hierarquia e ritmo", 812],
        ["Espaçamento e escala", 733],
        ["Consistência na prática", 690],
        ["Tokens de design", 1104],
        ["Exercício guiado", 845],
      ]),
      mod("Tipografia", [
        ["Escolhendo famílias tipográficas", 902],
        ["Escala tipográfica modular", 1015],
        ["Legibilidade em telas", 764],
        ["Tipografia responsiva", 828],
        ["Aplicando no sistema", 690],
      ]),
      mod("Cores e Contraste", [
        ["Teoria da cor aplicada", 860],
        ["Paletas semânticas", 920],
        ["Contraste e acessibilidade", 1012],
        ["Modo escuro do zero", 1140],
      ]),
      mod("Layout e Composição", [
        ["Sistemas de grid", 970],
        ["Composição e alinhamento", 815],
        ["Densidade de informação", 742],
        ["Breakpoints na prática", 880],
        ["Layouts complexos", 1065],
        ["Revisão do módulo", 505],
      ]),
      mod("Componentes", [
        ["Anatomia de um componente", 890],
        ["Botões e estados", 1120],
        ["Campos de formulário", 1240],
        ["Navegação e menus", 980],
        ["Modais e overlays", 1030],
        ["Tabelas e listas", 1150],
        ["Feedback e notificações", 870],
        ["Documentando componentes", 940],
      ]),
      mod("Sistemas de Grid", [
        ["Grid de 8 pontos", 760],
        ["Colunas e calhas", 690],
        ["Grid fluido vs fixo", 820],
        ["Aplicando ao produto", 910],
      ]),
      mod("Prototipagem", [
        ["Do estático ao interativo", 880],
        ["Estados e variantes", 950],
        ["Microinterações", 1080],
        ["Prototipagem avançada", 1160],
        ["Testando com usuários", 990],
        ["Iterando com feedback", 830],
      ]),
      mod("Design Responsivo", [
        ["Mobile first na prática", 940],
        ["Adaptação de componentes", 1020],
        ["Imagens e mídia", 780],
        ["Performance percebida", 860],
        ["Checklist responsivo", 620],
      ]),
      mod("Boas Práticas", [
        ["Governança do sistema", 1010],
        ["Versionamento", 890],
        ["Contribuição da equipe", 940],
        ["Métricas de adoção", 820],
      ]),
      mod("Projeto Final", [
        ["Briefing do projeto", 640],
        ["Estruturando as bases", 1180],
        ["Construindo componentes", 1320],
        ["Documentação final", 1050],
        ["Apresentando o sistema", 880],
        ["Conclusão do curso", 520],
      ]),
    ],
  },
  {
    title: "UI/UX Design Completo",
    slug: "ui-ux-design-completo",
    tagline: "Da pesquisa ao protótipo de alta fidelidade, com projetos reais.",
    description:
      "Um percurso completo por UI e UX: entenda usuários, estruture fluxos, desenhe interfaces bonitas e valide suas decisões com testes reais.",
    thumb: img("photo-1559028012-481c04fa702d"),
    backdrop: img("photo-1559028012-481c04fa702d", 1600),
    category: "design",
    instructor: "Lucas Martins",
    level: "Iniciante ao Avançado",
    rating: 4.8,
    ratingCount: 2310,
    learningPoints: [
      "Conduzir pesquisa com usuários",
      "Criar wireframes e fluxos",
      "Desenhar interfaces de alta fidelidade",
      "Aplicar heurísticas de usabilidade",
      "Montar um portfólio de peso",
      "Apresentar decisões de design",
    ],
    resourceCount: 18,
    updatedLabel: "Março/2024",
    modules: [
      mod("Fundamentos de UX", [
        ["O que é experiência do usuário", 680],
        ["Processo de design centrado no usuário", 890],
        ["Personas e jornadas", 1020],
        ["Arquitetura da informação", 950],
      ]),
      mod("Pesquisa", [
        ["Entrevistas com usuários", 1080],
        ["Pesquisa quantitativa", 920],
        ["Análise de concorrência", 760],
        ["Sintetizando insights", 840],
      ]),
      mod("Wireframes e Fluxos", [
        ["Fluxos de tarefa", 800],
        ["Wireframes de baixa fidelidade", 940],
        ["Prototipagem rápida", 1010],
      ]),
      mod("Interface Visual", [
        ["Fundamentos visuais", 990],
        ["Grid e composição", 880],
        ["Cor e tipografia na UI", 1120],
        ["Alta fidelidade na prática", 1340],
      ]),
      mod("Validação", [
        ["Testes de usabilidade", 1060],
        ["Métricas de experiência", 870],
        ["Iteração contínua", 790],
      ]),
    ],
  },
  {
    title: "JavaScript do Básico ao Avançado",
    slug: "javascript-do-basico-ao-avancado",
    tagline: "Domine a linguagem que move a web moderna.",
    description:
      "Do primeiro `console.log` até padrões avançados, assincronismo e performance. Um curso denso e prático para você programar com segurança.",
    thumb: img("photo-1579468118864-1b9ea3c0db4a"),
    backdrop: img("photo-1579468118864-1b9ea3c0db4a", 1600),
    category: "desenvolvimento",
    instructor: "Ana Beatriz",
    level: "Iniciante ao Avançado",
    rating: 4.9,
    ratingCount: 3180,
    learningPoints: [
      "Dominar sintaxe e tipos da linguagem",
      "Trabalhar com assincronismo e Promises",
      "Manipular o DOM com eficiência",
      "Entender closures e o event loop",
      "Escrever código modular e testável",
      "Otimizar performance no navegador",
    ],
    resourceCount: 24,
    updatedLabel: "Maio/2024",
    modules: [
      mod("Primeiros Passos", [
        ["Configurando o ambiente", 620],
        ["Variáveis e tipos", 880],
        ["Operadores e expressões", 760],
        ["Controle de fluxo", 940],
      ]),
      mod("Funções e Escopo", [
        ["Funções e parâmetros", 1010],
        ["Escopo e hoisting", 920],
        ["Closures na prática", 1180],
        ["Arrow functions e `this`", 1050],
      ]),
      mod("Estruturas de Dados", [
        ["Arrays e métodos essenciais", 1240],
        ["Objetos e desestruturação", 1080],
        ["Map, Set e iteradores", 960],
      ]),
      mod("Assincronismo", [
        ["Callbacks e o event loop", 1150],
        ["Promises do zero", 1290],
        ["async/await na prática", 1210],
        ["Consumindo APIs", 1340],
      ]),
      mod("DOM e Navegador", [
        ["Selecionando e alterando elementos", 1020],
        ["Eventos e delegação", 1100],
        ["Armazenamento local", 780],
      ]),
      mod("Avançado", [
        ["Módulos ES", 890],
        ["Padrões de projeto", 1260],
        ["Performance e memória", 1180],
        ["Projeto final", 1520],
      ]),
    ],
  },
  {
    title: "Marketing Digital na Prática",
    slug: "marketing-digital-na-pratica",
    tagline: "Estratégia, tráfego e conversão para crescer de verdade.",
    description:
      "Aprenda a montar uma operação de marketing digital completa: posicionamento, canais de aquisição, funis, anúncios e análise de resultados.",
    thumb: img("photo-1533750349088-cd871a92f312"),
    backdrop: img("photo-1533750349088-cd871a92f312", 1600),
    category: "marketing",
    instructor: "Rafael Souza",
    level: "Intermediário",
    rating: 4.7,
    ratingCount: 1580,
    learningPoints: [
      "Definir posicionamento e público",
      "Estruturar funis de conversão",
      "Criar campanhas de tráfego pago",
      "Produzir conteúdo que atrai",
      "Medir e otimizar resultados",
      "Escalar o que funciona",
    ],
    resourceCount: 15,
    updatedLabel: "Abril/2024",
    modules: [
      mod("Estratégia", [
        ["Posicionamento de marca", 880],
        ["Definindo o público-alvo", 940],
        ["Proposta de valor", 820],
      ]),
      mod("Canais de Aquisição", [
        ["SEO essencial", 1120],
        ["Tráfego pago: fundamentos", 1240],
        ["Redes sociais orgânicas", 980],
        ["E-mail marketing", 1050],
      ]),
      mod("Conversão", [
        ["Anatomia de um funil", 1010],
        ["Landing pages que convertem", 1180],
        ["Copywriting aplicado", 1090],
      ]),
      mod("Dados", [
        ["Métricas que importam", 960],
        ["Analytics na prática", 1140],
        ["Testes A/B", 1020],
        ["Relatórios e decisão", 880],
      ]),
    ],
  },
  {
    title: "Edição de Vídeos Profissional",
    slug: "edicao-de-videos-profissional",
    tagline: "Da timeline à finalização com cara de cinema.",
    description:
      "Domine o fluxo completo de edição: organização de material, ritmo narrativo, correção de cor, áudio e exportação para cada plataforma.",
    thumb: img("photo-1574717024653-61fd2cf4d44d"),
    backdrop: img("photo-1574717024653-61fd2cf4d44d", 1600),
    category: "fotografia",
    instructor: "Carla Nogueira",
    level: "Intermediário",
    rating: 4.8,
    ratingCount: 1120,
    isPremium: true,
    learningPoints: [
      "Organizar projetos e mídia",
      "Construir ritmo e narrativa",
      "Aplicar correção e color grading",
      "Tratar áudio profissionalmente",
      "Criar títulos e animações",
      "Exportar para cada plataforma",
    ],
    resourceCount: 20,
    updatedLabel: "Fevereiro/2024",
    modules: [
      mod("Fundamentos", [
        ["Fluxo de trabalho profissional", 820],
        ["Organização de mídia", 760],
        ["Cortes e ritmo", 1040],
      ]),
      mod("Narrativa", [
        ["Estrutura de uma história", 980],
        ["Cortes invisíveis", 1120],
        ["Ritmo musical", 890],
      ]),
      mod("Cor e Áudio", [
        ["Correção de cor", 1240],
        ["Color grading criativo", 1380],
        ["Mixagem de áudio", 1060],
        ["Trilha e efeitos", 940],
      ]),
      mod("Finalização", [
        ["Títulos e motion", 1150],
        ["Exportação otimizada", 820],
        ["Entrega ao cliente", 690],
      ]),
    ],
  },
  {
    title: "Python para Iniciantes",
    slug: "python-para-iniciantes",
    tagline: "Sua porta de entrada para programação e dados.",
    description:
      "Comece do absoluto zero em Python e chegue a automatizar tarefas, manipular dados e construir seus primeiros scripts úteis.",
    thumb: img("photo-1526379095098-d400fd0bf935"),
    backdrop: img("photo-1526379095098-d400fd0bf935", 1600),
    category: "desenvolvimento",
    instructor: "Ana Beatriz",
    level: "Iniciante",
    rating: 4.9,
    ratingCount: 4210,
    learningPoints: [
      "Escrever seus primeiros programas",
      "Trabalhar com listas e dicionários",
      "Automatizar tarefas repetitivas",
      "Ler e escrever arquivos",
      "Consumir APIs com Python",
      "Estruturar projetos maiores",
    ],
    resourceCount: 16,
    updatedLabel: "Maio/2024",
    modules: [
      mod("Começando", [
        ["Instalando o Python", 540],
        ["Seu primeiro script", 680],
        ["Variáveis e tipos", 820],
      ]),
      mod("Lógica", [
        ["Condicionais", 760],
        ["Laços de repetição", 890],
        ["Funções", 1010],
      ]),
      mod("Dados", [
        ["Listas e tuplas", 940],
        ["Dicionários", 880],
        ["Compreensões de lista", 1020],
      ]),
      mod("Prática", [
        ["Manipulando arquivos", 960],
        ["Consumindo APIs", 1180],
        ["Automatizando tarefas", 1240],
        ["Projeto final", 1380],
      ]),
    ],
  },
  {
    title: "Figma do Zero ao Avançado",
    slug: "figma-do-zero-ao-avancado",
    tagline: "A ferramenta que o mercado inteiro usa, sem mistério.",
    description:
      "Aprenda Figma de verdade: auto layout, componentes, variáveis, protótipos interativos e colaboração em equipe.",
    thumb: img("photo-1611224923853-80b023f02d71"),
    backdrop: img("photo-1611224923853-80b023f02d71", 1600),
    category: "design",
    instructor: "Lucas Martins",
    level: "Iniciante ao Avançado",
    rating: 4.8,
    ratingCount: 2870,
    learningPoints: [
      "Dominar auto layout",
      "Criar componentes e variantes",
      "Usar variáveis e modos",
      "Prototipar interações",
      "Colaborar com desenvolvedores",
      "Organizar bibliotecas",
    ],
    resourceCount: 14,
    updatedLabel: "Maio/2024",
    modules: [
      mod("Interface", [
        ["Conhecendo o Figma", 620],
        ["Frames e camadas", 780],
        ["Estilos básicos", 840],
      ]),
      mod("Auto Layout", [
        ["Auto layout na prática", 1120],
        ["Layouts responsivos", 1040],
        ["Constraints", 890],
      ]),
      mod("Componentes", [
        ["Criando componentes", 980],
        ["Variantes e propriedades", 1210],
        ["Bibliotecas compartilhadas", 1060],
      ]),
      mod("Protótipos", [
        ["Interações básicas", 940],
        ["Smart animate", 1150],
        ["Handoff para devs", 880],
      ]),
    ],
  },
  {
    title: "Excel do Básico ao Avançado",
    slug: "excel-do-basico-ao-avancado",
    tagline: "Planilhas que trabalham por você.",
    description:
      "Fórmulas, tabelas dinâmicas, dashboards e automação: tudo que você precisa para se tornar a referência em dados do seu time.",
    thumb: img("photo-1454165804606-c3d57bc86b40"),
    backdrop: img("photo-1454165804606-c3d57bc86b40", 1600),
    category: "produtividade",
    instructor: "Rafael Souza",
    level: "Iniciante ao Avançado",
    rating: 4.7,
    ratingCount: 3640,
    learningPoints: [
      "Dominar fórmulas essenciais",
      "Criar tabelas dinâmicas",
      "Montar dashboards visuais",
      "Automatizar com macros",
      "Tratar grandes volumes de dados",
      "Apresentar resultados com clareza",
    ],
    resourceCount: 22,
    updatedLabel: "Janeiro/2024",
    modules: [
      mod("Fundamentos", [
        ["Interface e navegação", 600],
        ["Fórmulas básicas", 840],
        ["Formatação eficiente", 720],
      ]),
      mod("Fórmulas Avançadas", [
        ["PROCV e PROCX", 1140],
        ["Funções condicionais", 1020],
        ["Funções de texto e data", 960],
      ]),
      mod("Análise", [
        ["Tabelas dinâmicas", 1280],
        ["Gráficos que comunicam", 1050],
        ["Dashboards", 1420],
      ]),
      mod("Automação", [
        ["Introdução a macros", 1160],
        ["Automatizando relatórios", 1240],
      ]),
    ],
  },
  {
    title: "Mentalidade & Produtividade",
    slug: "mentalidade-e-produtividade",
    tagline: "Sistemas simples para fazer o que importa.",
    description:
      "Menos truques, mais sistema. Construa rotinas sustentáveis, gerencie energia e foco, e execute com consistência no longo prazo.",
    thumb: img("photo-1507003211169-0a1dd7228f2d"),
    backdrop: img("photo-1507003211169-0a1dd7228f2d", 1600),
    category: "produtividade",
    instructor: "Rafael Souza",
    level: "Iniciante",
    rating: 4.9,
    ratingCount: 1980,
    learningPoints: [
      "Definir prioridades reais",
      "Construir rotinas sustentáveis",
      "Gerenciar energia e foco",
      "Vencer a procrastinação",
      "Organizar tarefas e projetos",
      "Manter consistência no longo prazo",
    ],
    resourceCount: 9,
    updatedLabel: "Março/2024",
    modules: [
      mod("Fundamentos", [
        ["O mito da produtividade", 720],
        ["Energia versus tempo", 860],
        ["Definindo prioridades", 940],
      ]),
      mod("Sistemas", [
        ["Capturando tudo", 820],
        ["Organizando projetos", 980],
        ["Revisão semanal", 890],
      ]),
      mod("Foco", [
        ["Trabalho profundo", 1080],
        ["Eliminando distrações", 920],
        ["Hábitos que sustentam", 1010],
      ]),
    ],
  },
  {
    title: "Photoshop para Iniciantes",
    slug: "photoshop-para-iniciantes",
    tagline: "Edite imagens com confiança desde a primeira aula.",
    description:
      "Aprenda as ferramentas essenciais do Photoshop e comece a criar composições, tratar fotos e produzir peças gráficas profissionais.",
    thumb: img("photo-1572044162444-ad60f128bdea"),
    backdrop: img("photo-1572044162444-ad60f128bdea", 1600),
    category: "design",
    instructor: "Carla Nogueira",
    level: "Iniciante",
    rating: 4.8,
    ratingCount: 2140,
    learningPoints: [
      "Dominar camadas e máscaras",
      "Fazer seleções precisas",
      "Tratar e retocar fotos",
      "Criar composições criativas",
      "Trabalhar com tipografia",
      "Exportar para web e impressão",
    ],
    resourceCount: 11,
    updatedLabel: "Fevereiro/2024",
    modules: [
      mod("Fundamentos", [
        ["Interface e ferramentas", 680],
        ["Camadas e máscaras", 1020],
        ["Seleções precisas", 940],
      ]),
      mod("Tratamento", [
        ["Ajustes de luz e cor", 1140],
        ["Retoque de retratos", 1280],
        ["Removendo objetos", 980],
      ]),
      mod("Criação", [
        ["Composições criativas", 1220],
        ["Tipografia aplicada", 890],
        ["Exportação", 720],
      ]),
    ],
  },
  {
    title: "ChatGPT na Prática",
    slug: "chatgpt-na-pratica",
    tagline: "Use IA para multiplicar seu trabalho, não substituí-lo.",
    description:
      "Aprenda a escrever prompts eficazes, automatizar tarefas do dia a dia e integrar IA ao seu fluxo profissional com critério.",
    thumb: img("photo-1677442136019-21780ecad995"),
    backdrop: img("photo-1677442136019-21780ecad995", 1600),
    category: "produtividade",
    instructor: "Ana Beatriz",
    level: "Iniciante",
    rating: 4.9,
    ratingCount: 5120,
    isNew: true,
    learningPoints: [
      "Escrever prompts eficazes",
      "Automatizar tarefas repetitivas",
      "Analisar dados com IA",
      "Criar conteúdo com qualidade",
      "Integrar IA ao seu fluxo",
      "Reconhecer limites e riscos",
    ],
    resourceCount: 8,
    updatedLabel: "Junho/2024",
    modules: [
      mod("Fundamentos", [
        ["Como modelos de linguagem funcionam", 780],
        ["Anatomia de um bom prompt", 1020],
        ["Contexto e exemplos", 940],
      ]),
      mod("Aplicações", [
        ["Escrita e revisão", 1080],
        ["Análise de dados", 1160],
        ["Pesquisa e síntese", 990],
      ]),
      mod("Fluxo Profissional", [
        ["Automatizando rotinas", 1140],
        ["Limites e verificação", 860],
      ]),
    ],
  },
  {
    title: "Criação de Conteúdo para YouTube",
    slug: "criacao-de-conteudo-para-youtube",
    tagline: "Do roteiro ao play: construa um canal que cresce.",
    description:
      "Planejamento, roteiro, gravação, edição e algoritmo. Tudo o que você precisa para publicar com consistência e crescer de forma orgânica.",
    thumb: img("photo-1598550476439-6847785fcea6"),
    backdrop: img("photo-1598550476439-6847785fcea6", 1600),
    category: "marketing",
    instructor: "Carla Nogueira",
    level: "Iniciante",
    rating: 4.7,
    ratingCount: 1340,
    isNew: true,
    learningPoints: [
      "Definir o posicionamento do canal",
      "Escrever roteiros que prendem",
      "Gravar com equipamento acessível",
      "Editar com ritmo",
      "Entender o algoritmo",
      "Crescer com consistência",
    ],
    resourceCount: 13,
    updatedLabel: "Junho/2024",
    modules: [
      mod("Planejamento", [
        ["Definindo seu nicho", 820],
        ["Pesquisa de pautas", 940],
        ["Calendário de publicação", 760],
      ]),
      mod("Produção", [
        ["Roteiro que prende", 1120],
        ["Gravação prática", 1240],
        ["Áudio e iluminação", 1060],
      ]),
      mod("Crescimento", [
        ["Títulos e thumbnails", 1180],
        ["Entendendo o algoritmo", 1020],
        ["Analisando métricas", 890],
      ]),
    ],
  },
  {
    title: "TypeScript do Zero ao Avançado",
    slug: "typescript-do-zero-ao-avancado",
    tagline: "Tipos que evitam bugs antes deles existirem.",
    description:
      "Aprenda TypeScript de forma progressiva: dos tipos básicos aos genéricos avançados, integrando com React e Node em projetos reais.",
    thumb: img("photo-1516116216624-53e697fedbea"),
    backdrop: img("photo-1516116216624-53e697fedbea", 1600),
    category: "desenvolvimento",
    instructor: "Ana Beatriz",
    level: "Intermediário",
    rating: 4.9,
    ratingCount: 1760,
    isNew: true,
    learningPoints: [
      "Tipar código com segurança",
      "Usar genéricos com confiança",
      "Modelar dados complexos",
      "Integrar com React e Node",
      "Configurar o compilador",
      "Migrar projetos JavaScript",
    ],
    resourceCount: 17,
    updatedLabel: "Junho/2024",
    modules: [
      mod("Fundamentos", [
        ["Por que TypeScript", 680],
        ["Tipos primitivos", 840],
        ["Interfaces e tipos", 980],
      ]),
      mod("Intermediário", [
        ["Unions e narrowing", 1120],
        ["Genéricos na prática", 1280],
        ["Utility types", 1040],
      ]),
      mod("Avançado", [
        ["Tipos condicionais", 1340],
        ["Inferência avançada", 1180],
        ["Integrando com React", 1260],
        ["Migrando um projeto", 1150],
      ]),
    ],
  },
  {
    title: "Fotografia para Iniciantes",
    slug: "fotografia-para-iniciantes",
    tagline: "Entenda a luz e nunca mais fotografe no automático.",
    description:
      "Do triângulo de exposição à composição e edição: aprenda a fotografar com intenção, com qualquer câmera que você tiver em mãos.",
    thumb: img("photo-1502920917128-1aa500764cbd"),
    backdrop: img("photo-1502920917128-1aa500764cbd", 1600),
    category: "fotografia",
    instructor: "Carla Nogueira",
    level: "Iniciante",
    rating: 4.8,
    ratingCount: 1450,
    isNew: true,
    learningPoints: [
      "Dominar o triângulo de exposição",
      "Compor imagens com intenção",
      "Trabalhar com luz natural",
      "Fotografar em modo manual",
      "Editar suas fotos",
      "Desenvolver seu olhar",
    ],
    resourceCount: 10,
    updatedLabel: "Junho/2024",
    modules: [
      mod("Câmera", [
        ["Conhecendo sua câmera", 720],
        ["Abertura, ISO e velocidade", 1180],
        ["Modo manual na prática", 1040],
      ]),
      mod("Composição", [
        ["Regras de composição", 940],
        ["Luz natural", 1080],
        ["Enquadramento criativo", 890],
      ]),
      mod("Pós-produção", [
        ["Fluxo de edição", 1020],
        ["Ajustes essenciais", 960],
      ]),
    ],
  },
  {
    title: "Investimentos para Iniciantes",
    slug: "investimentos-para-iniciantes",
    tagline: "Comece a investir com clareza e sem achismo.",
    description:
      "Entenda renda fixa, renda variável, risco e diversificação. Monte uma carteira alinhada aos seus objetivos, do zero.",
    thumb: img("photo-1611974789855-9c2a0a7236a3"),
    backdrop: img("photo-1611974789855-9c2a0a7236a3", 1600),
    category: "negocios",
    instructor: "Rafael Souza",
    level: "Iniciante",
    rating: 4.7,
    ratingCount: 2260,
    isNew: true,
    learningPoints: [
      "Organizar sua vida financeira",
      "Entender renda fixa e variável",
      "Avaliar risco e retorno",
      "Montar uma carteira diversificada",
      "Evitar erros comuns",
      "Investir com consistência",
    ],
    resourceCount: 12,
    updatedLabel: "Junho/2024",
    modules: [
      mod("Base", [
        ["Organizando as finanças", 840],
        ["Reserva de emergência", 760],
        ["Objetivos e prazos", 820],
      ]),
      mod("Renda Fixa", [
        ["Tesouro Direto", 1020],
        ["CDB, LCI e LCA", 940],
        ["Comparando opções", 880],
      ]),
      mod("Renda Variável", [
        ["Ações na prática", 1240],
        ["Fundos imobiliários", 1080],
        ["Diversificação", 1150],
      ]),
    ],
  },
  {
    title: "UX Research na Prática",
    slug: "ux-research-na-pratica",
    tagline: "Decisões de produto guiadas por evidência.",
    description:
      "Aprenda a planejar, conduzir e sintetizar pesquisas com usuários, transformando conversas em decisões de produto defensáveis.",
    thumb: img("photo-1552664730-d307ca884978"),
    backdrop: img("photo-1552664730-d307ca884978", 1600),
    category: "design",
    instructor: "Lucas Martins",
    level: "Intermediário",
    rating: 4.8,
    ratingCount: 980,
    isNew: true,
    learningPoints: [
      "Planejar estudos de pesquisa",
      "Conduzir entrevistas eficazes",
      "Aplicar métodos quantitativos",
      "Sintetizar achados",
      "Comunicar insights",
      "Influenciar decisões de produto",
    ],
    resourceCount: 14,
    updatedLabel: "Junho/2024",
    modules: [
      mod("Planejamento", [
        ["Perguntas de pesquisa", 880],
        ["Escolhendo o método", 1020],
        ["Recrutamento", 940],
      ]),
      mod("Execução", [
        ["Entrevistas em profundidade", 1240],
        ["Testes de usabilidade", 1180],
        ["Pesquisas quantitativas", 1060],
      ]),
      mod("Síntese", [
        ["Análise temática", 1120],
        ["Comunicando resultados", 980],
      ]),
    ],
  },
  {
    title: "Copywriting que Converte",
    slug: "copywriting-que-converte",
    tagline: "Palavras que vendem sem parecer que estão vendendo.",
    description:
      "Domine as estruturas de persuasão, escreva headlines irresistíveis e produza textos que geram ação em qualquer canal.",
    thumb: img("photo-1455390582262-044cdead277a"),
    backdrop: img("photo-1455390582262-044cdead277a", 1600),
    category: "marketing",
    instructor: "Rafael Souza",
    level: "Intermediário",
    rating: 4.8,
    ratingCount: 1620,
    isNew: true,
    learningPoints: [
      "Escrever headlines memoráveis",
      "Aplicar gatilhos com ética",
      "Estruturar páginas de venda",
      "Adaptar o tom por canal",
      "Revisar e testar textos",
      "Construir uma voz de marca",
    ],
    resourceCount: 11,
    updatedLabel: "Junho/2024",
    modules: [
      mod("Fundamentos", [
        ["O que é copywriting", 720],
        ["Conhecendo o público", 940],
        ["Estruturas clássicas", 1080],
      ]),
      mod("Prática", [
        ["Headlines que funcionam", 1140],
        ["Páginas de venda", 1320],
        ["E-mails que convertem", 1060],
      ]),
      mod("Refino", [
        ["Revisão implacável", 880],
        ["Testando variações", 960],
      ]),
    ],
  },
];

async function main() {
  console.log("→ Limpando dados de conteúdo…");
  await db.delete(lessonProgress);
  await db.delete(watchlist);
  await db.delete(enrollments);
  await db.delete(materials);
  await db.delete(lessons);
  await db.delete(modules);
  await db.delete(courses);
  await db.delete(instructors);
  await db.delete(categories);

  console.log("→ Categorias…");
  const catRows = await db
    .insert(categories)
    .values(CATEGORIES.map((c, i) => ({ ...c, sortOrder: i })))
    .returning();
  const catBySlug = new Map(catRows.map((c) => [c.slug, c.id]));

  console.log("→ Instrutores…");
  const instRows = await db.insert(instructors).values(INSTRUCTORS).returning();
  const instByName = new Map(instRows.map((i) => [i.name, i.id]));

  console.log("→ Cursos, módulos e aulas…");
  let videoIdx = 0;

  for (const [ci, c] of COURSES.entries()) {
    const totalDuration = c.modules.reduce(
      (sum, m) => sum + m.lessons.reduce((s, l) => s + l.duration, 0),
      0,
    );

    const [course] = await db
      .insert(courses)
      .values({
        title: c.title,
        slug: c.slug,
        tagline: c.tagline,
        description: c.description,
        thumbnailUrl: c.thumb,
        backdropUrl: c.backdrop,
        categoryId: catBySlug.get(c.category)!,
        instructorId: instByName.get(c.instructor)!,
        level: c.level,
        rating: c.rating,
        ratingCount: c.ratingCount,
        totalDuration,
        isPremium: c.isPremium ?? false,
        isNew: c.isNew ?? false,
        learningPoints: c.learningPoints,
        resourceCount: c.resourceCount,
        updatedLabel: c.updatedLabel,
        sortOrder: ci,
      })
      .returning();

    let lessonOrder = 0;

    for (const [mi, m] of c.modules.entries()) {
      const [module] = await db
        .insert(modules)
        .values({ courseId: course.id, title: m.title, sortOrder: mi })
        .returning();

      await db.insert(lessons).values(
        m.lessons.map((l, li) => {
          const order = lessonOrder++;
          return {
            moduleId: module.id,
            courseId: course.id,
            title: l.title,
            slug: `${order + 1}-${l.title
              .normalize("NFD")
              .replace(/[̀-ͯ]/g, "")
              .toLowerCase()
              .replace(/[^a-z0-9\s-]/g, "")
              .trim()
              .replace(/\s+/g, "-")}`,
            description: `Nesta aula você vai aprofundar "${l.title}" dentro do módulo ${m.title}, com exemplos práticos e aplicáveis no seu dia a dia.`,
            videoUrl: VIDEOS[videoIdx++ % VIDEOS.length],
            duration: l.duration,
            // As duas primeiras aulas de cada curso ficam abertas.
            isFree: mi === 0 && li < 2,
            learningPoints:
              mi === 0 && li === 0 ? c.learningPoints.slice(0, 4) : [],
            sortOrder: order,
          };
        }),
      );
    }

    // Materiais de apoio do curso
    await db.insert(materials).values([
      {
        courseId: course.id,
        title: `${c.title} — Slides do curso`,
        fileUrl: "#",
        fileType: "pdf",
        sizeLabel: "4,2 MB",
      },
      {
        courseId: course.id,
        title: "Checklist prático",
        fileUrl: "#",
        fileType: "pdf",
        sizeLabel: "820 KB",
      },
      {
        courseId: course.id,
        title: "Arquivos de exercício",
        fileUrl: "#",
        fileType: "zip",
        sizeLabel: "18,6 MB",
      },
    ]);
  }

  console.log("→ Usuários…");
  const passwordHash = await bcrypt.hash("learnix123", 10);
  const adminHash = await bcrypt.hash("admin123", 10);

  await db.delete(users).where(eq(users.email, "aluno@learnix.com"));
  await db.delete(users).where(eq(users.email, "admin@learnix.com"));

  const [student] = await db
    .insert(users)
    .values({
      name: "Fernando Rodrigues",
      email: "aluno@learnix.com",
      passwordHash,
      avatarUrl: avatar(52),
      role: "student",
      isPremium: true,
    })
    .returning();

  await db.insert(users).values({
    name: "Admin Learnix",
    email: "admin@learnix.com",
    passwordHash: adminHash,
    avatarUrl: avatar(11),
    role: "admin",
    isPremium: true,
  });

  console.log("→ Progresso de exemplo para o aluno…");

  // "Continue aprendendo" — os 4 cursos do mockup, com progressos distintos.
  const inProgress: [string, number][] = [
    ["ui-ux-design-completo", 0.72],
    ["javascript-do-basico-ao-avancado", 0.45],
    ["marketing-digital-na-pratica", 0.3],
    ["edicao-de-videos-profissional", 0.8],
    ["design-system-na-pratica", 0.28],
  ];

  for (const [slug, pct] of inProgress) {
    const [course] = await db
      .select()
      .from(courses)
      .where(eq(courses.slug, slug))
      .limit(1);
    if (!course) continue;

    await db
      .insert(enrollments)
      .values({ userId: student.id, courseId: course.id })
      .onConflictDoNothing();

    const courseLessons = await db
      .select()
      .from(lessons)
      .where(eq(lessons.courseId, course.id))
      .orderBy(lessons.sortOrder);

    const completedCount = Math.max(1, Math.round(courseLessons.length * pct));

    for (const [i, lesson] of courseLessons.entries()) {
      if (i < completedCount - 1) {
        await db
          .insert(lessonProgress)
          .values({
            userId: student.id,
            lessonId: lesson.id,
            courseId: course.id,
            positionSeconds: lesson.duration,
            completed: true,
          })
          .onConflictDoNothing();
      } else if (i === completedCount - 1) {
        // Aula atual: parada no meio.
        await db
          .insert(lessonProgress)
          .values({
            userId: student.id,
            lessonId: lesson.id,
            courseId: course.id,
            positionSeconds: Math.round(lesson.duration * 0.4),
            completed: false,
          })
          .onConflictDoNothing();
      }
    }
  }

  // Minha lista
  for (const slug of ["python-para-iniciantes", "figma-do-zero-ao-avancado", "chatgpt-na-pratica"]) {
    const [course] = await db
      .select()
      .from(courses)
      .where(eq(courses.slug, slug))
      .limit(1);
    if (course) {
      await db
        .insert(watchlist)
        .values({ userId: student.id, courseId: course.id })
        .onConflictDoNothing();
    }
  }

  const [{ count: courseCount }] = await db
    .select({ count: raw<number>`count(*)::int` })
    .from(courses);
  const [{ count: lessonCount }] = await db
    .select({ count: raw<number>`count(*)::int` })
    .from(lessons);

  console.log(`
✓ Seed concluído
  ${courseCount} cursos · ${lessonCount} aulas · ${CATEGORIES.length} categorias

  Acessos de teste:
    aluno@learnix.com / learnix123   (aluno premium, com progresso)
    admin@learnix.com / admin123     (administrador)
`);
}

main().catch((err) => {
  console.error("Falha no seed:", err);
  process.exit(1);
});
