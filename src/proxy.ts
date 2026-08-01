import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE = "learnix_session";

/** Rotas que exigem sessão. */
const PROTECTED = [
  "/inicio",
  "/explorar",
  "/cursos",
  "/categorias",
  "/minha-lista",
  "/historico",
  "/certificados",
  "/downloads",
  "/configuracoes",
  "/assistir",
  "/admin",
];

/** Rotas de autenticação — redirecionam para dentro quando já há sessão. */
const AUTH_ROUTES = ["/entrar", "/criar-conta"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = Boolean(request.cookies.get(SESSION_COOKIE)?.value);

  const isProtected = PROTECTED.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );

  if (isProtected && !hasSession) {
    const url = new URL("/entrar", request.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (AUTH_ROUTES.includes(pathname) && hasSession) {
    return NextResponse.redirect(new URL("/inicio", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp|gif|mp4)$).*)"],
};
