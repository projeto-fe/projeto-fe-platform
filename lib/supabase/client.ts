import { createBrowserClient } from "@supabase/ssr";

import { chavePublicaDoSupabase, urlDoSupabase } from "@/lib/ambiente";

/**
 * Cliente para uso no navegador. Só alcança o que a política de acesso do
 * banco permite para a pessoa autenticada. Dado sensível de criança nunca
 * passa por aqui: essas telas buscam no servidor.
 */
export function criarClienteDoNavegador() {
  return createBrowserClient(urlDoSupabase(), chavePublicaDoSupabase());
}
