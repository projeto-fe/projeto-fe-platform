/**
 * Cores da identidade visual para usos que NÃO são CSS e por isso não aceitam
 * token: themeColor do navegador, manifest do app, geração de imagem social e
 * o HTML dos e-mails (cliente de e-mail não entende variável CSS).
 *
 * Em CSS nada disso é usado. Lá a fonte é app/tokens.css.
 * Estes dois arquivos são os únicos onde valor literal é permitido, e o
 * verificador de tokens conhece os dois.
 */
export const marca = {
  laranja: "#f05a28",
  azul: "#1f2a44",
  branco: "#ffffff",
} as const;

/** Neutros equivalentes aos tokens, para o HTML dos e-mails. */
export const marcaNeutros = {
  fundo: "#f6f8fb",
  linha: "#dde4ee",
  textoCorrido: "#4e5665",
  textoDiscreto: "#6b7280",
  brancoTransparente70: "rgba(255,255,255,.7)",
} as const;
