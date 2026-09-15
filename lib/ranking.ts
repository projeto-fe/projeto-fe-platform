import { unstable_cache } from "next/cache";

import { criarClienteAdministrativo } from "@/lib/supabase/server";

export type LinhaDoRanking = {
  crianca_id: string;
  nome_completo: string;
  nome_publico: string;
  pontos: number;
};

/**
 * `ranking_interno` soma `pontuacao_eventos` inteiro a cada leitura, e três
 * telas liam isso de forma independente (dashboard, IDE JOGAI, ranking
 * público) — a mesma agregação cara, recalculada em toda visita. Cacheia até
 * a próxima pontuação mudar; `lancarPonto` e `estornarLancamento` invalidam
 * a tag na hora.
 *
 * Usa o cliente administrativo (sem `cookies()`) porque `unstable_cache` não
 * pode depender de API dinâmica de requisição. É seguro: a view não devolve
 * nada que um usuário autenticado ativo já não visse por RLS, e cada tela
 * decide sozinha quais colunas mostrar (a pública nunca lê `nome_completo`).
 */
const buscarRanking = unstable_cache(
  async (): Promise<LinhaDoRanking[]> => {
    const supabase = criarClienteAdministrativo();
    const { data } = await supabase
      .from("ranking_interno")
      .select("crianca_id, nome_completo, nome_publico, pontos")
      .order("pontos", { ascending: false });
    return data ?? [];
  },
  ["ranking-interno"],
  { tags: ["ranking"] },
);

export function carregarRanking() {
  return buscarRanking();
}
