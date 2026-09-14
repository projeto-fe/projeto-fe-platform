/**
 * Leitura das variáveis de ambiente, com erro que diz o que fazer.
 *
 * As variáveis NEXT_PUBLIC_ são substituídas pelo valor no momento do build,
 * não lidas em execução. Se estiverem indisponíveis durante o build (por
 * exemplo, marcadas como sensíveis na Vercel), o código compilado carrega
 * `undefined` gravado dentro, e nenhuma configuração posterior corrige.
 *
 * Sem estas checagens o sintoma é um 500 sem explicação em todas as rotas,
 * porque quem falha é o cliente do banco lá no fundo.
 */

const AVISO_PUBLICA =
  "Variável NEXT_PUBLIC_ é embutida durante o build, então precisa estar " +
  "disponível nesse momento. Na Vercel, confira se ela não está marcada como " +
  "sensível: variável sensível existe só em execução. Estas três não são " +
  "segredo, elas chegam ao navegador por definição.";

function exigirPublica(nome: string, valor: string | undefined) {
  if (!valor) throw new Error(`${nome} não chegou ao build. ${AVISO_PUBLICA}`);
  return valor;
}

export function urlDoSupabase() {
  return exigirPublica("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL);
}

export function chavePublicaDoSupabase() {
  return exigirPublica(
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

/** Esta é lida em execução, e pode (deve) ser sensível. */
export function chaveDeServicoDoSupabase() {
  const chave = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!chave) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY não está definida. Em desenvolvimento, confira " +
        "o .env.local. Em produção, confira as variáveis do projeto. Esta é lida " +
        "em execução, então pode ficar marcada como sensível.",
    );
  }

  return chave;
}

/** Endereço público do portal, usado para montar links em e-mails. */
export function enderecoDoPortal() {
  if (process.env.NEXT_PUBLIC_URL_DO_PORTAL) return process.env.NEXT_PUBLIC_URL_DO_PORTAL;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  return "http://localhost:3000";
}
