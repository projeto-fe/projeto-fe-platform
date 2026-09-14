/**
 * Cores da identidade visual para usos que NÃO são CSS e por isso não aceitam
 * token: themeColor do navegador, manifest do app, geração de imagem social.
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
