/**
 * Só funções puras: caminho e endereço do documento institucional. Acesso ao
 * Supabase fica em `lib/arquivos-dados.ts` (mesmo motivo da separação em
 * `lib/fotos.ts` / `lib/fotos-dados.ts`).
 */

export function caminhoDoGuiaCultural() {
  return "institucional/guia-cultural";
}

/** Endereço da rota que serve o arquivo, para usar num link. */
export function urlDoArquivo(caminho: string) {
  return `/arquivos/${caminho}`;
}
