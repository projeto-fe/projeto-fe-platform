/**
 * Só funções puras aqui: caminho e endereço da foto. Nada que toque o
 * Supabase — isso fica em `lib/fotos-dados.ts` — porque `MenuDaConta` (Client
 * Component, presente em toda página) importa este arquivo direto; misturar
 * os dois vazaria `next/headers` pro navegador (mesmo motivo da separação em
 * `lib/calendario.ts` / `lib/calendario-dados.ts`).
 */

export function caminhoFotoDaCrianca(criancaId: string) {
  return `criancas/${criancaId}`;
}

export function caminhoFotoDoUsuario(usuarioId: string) {
  return `perfis/${usuarioId}`;
}

/** Endereço da rota que serve a foto, para usar direto num `<img src>`. */
export function urlDaFoto(caminho: string) {
  return `/fotos/${caminho}`;
}
