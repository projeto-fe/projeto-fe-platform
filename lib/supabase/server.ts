import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

import {
  chaveDeServicoDoSupabase,
  chavePublicaDoSupabase,
  urlDoSupabase,
} from "@/lib/ambiente";

/**
 * Cliente para Server Components, Server Actions e Route Handlers.
 * Age como a pessoa autenticada, então continua sujeito às políticas do banco.
 */
export async function criarClienteDoServidor() {
  const armazemDeCookies = await cookies();

  return createServerClient(urlDoSupabase(), chavePublicaDoSupabase(), {
    cookies: {
      getAll() {
        return armazemDeCookies.getAll();
      },
      setAll(cookiesParaGravar) {
        try {
          for (const { name, value, options } of cookiesParaGravar) {
            armazemDeCookies.set(name, value, options);
          }
        } catch {
          // Server Component não pode gravar cookie. Quem renova a sessão
          // é o proxy, então ignorar aqui é seguro.
        }
      },
    },
  });
}

/**
 * Cliente administrativo. Ignora as políticas do banco, então só pode ser
 * usado onde a autorização já foi verificada por outro caminho: a página
 * pública do ranking e a escrita do log de auditoria.
 *
 * Nunca importe isto em componente de cliente.
 */
export function criarClienteAdministrativo() {
  return createServerClient(urlDoSupabase(), chaveDeServicoDoSupabase(), {
    cookies: { getAll: () => [], setAll: () => {} },
  });
}

/**
 * Confere uma senha sem tocar na sessão de quem está logado.
 *
 * Serve para etapa extra de confirmação em ação de alto impacto, como conceder
 * privilégio de administrador: prova que quem clicou é a pessoa, e não alguém
 * que encontrou o computador destravado. O cliente é efêmero e não persiste
 * nada, senão o login de verificação sobrescreveria o cookie de sessão.
 */
export async function conferirSenha(email: string, senha: string) {
  const efemero = createClient(urlDoSupabase(), chavePublicaDoSupabase(), {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });

  const { error } = await efemero.auth.signInWithPassword({ email, password: senha });
  return !error;
}
