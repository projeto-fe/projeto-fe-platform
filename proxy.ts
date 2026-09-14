import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { chavePublicaDoSupabase, urlDoSupabase } from "@/lib/ambiente";

/**
 * No Next 16 este arquivo se chama proxy.ts. Era middleware.ts até a 15.
 *
 * Duas responsabilidades:
 *   1. renovar a sessão a cada requisição, gravando os cookies na resposta
 *   2. barrar rota privada antes de qualquer HTML ser gerado
 *
 * A verificação usa getUser(), que valida o token no servidor de
 * autenticação. getSession() apenas lê o cookie, que o navegador controla,
 * e por isso não serve como porta.
 */

const ROTAS_PUBLICAS = ["/login", "/convite", "/ranking", "/auth"];

export async function proxy(request: NextRequest) {
  let resposta = NextResponse.next({ request });

  const supabase = createServerClient(
    urlDoSupabase(),
    chavePublicaDoSupabase(),
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesParaGravar) {
          for (const { name, value } of cookiesParaGravar) {
            request.cookies.set(name, value);
          }
          resposta = NextResponse.next({ request });
          for (const { name, value, options } of cookiesParaGravar) {
            resposta.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const caminho = request.nextUrl.pathname;
  const ehPublica = ROTAS_PUBLICAS.some(
    (rota) => caminho === rota || caminho.startsWith(`${rota}/`),
  );

  if (!user && !ehPublica) {
    const destino = request.nextUrl.clone();
    destino.pathname = "/login";
    // guarda para onde a pessoa queria ir, para voltar depois do login
    destino.searchParams.set("proximo", caminho);
    return NextResponse.redirect(destino);
  }

  if (user && caminho === "/login") {
    const destino = request.nextUrl.clone();
    destino.pathname = "/";
    destino.search = "";
    return NextResponse.redirect(destino);
  }

  return resposta;
}

export const config = {
  // Sem matcher, o proxy rodaria também em CSS, imagem e fonte, e a regra de
  // autenticação bloquearia o carregamento desses arquivos.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)$).*)",
  ],
};
