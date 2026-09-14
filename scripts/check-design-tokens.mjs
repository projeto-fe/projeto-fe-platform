#!/usr/bin/env node
/**
 * Falha o build quando uma cor escapa do sistema de tokens.
 *
 * Existe porque enforcement em modo aviso não existe na prática: o Pilar tem
 * as mesmas regras como warning "até a onda zerar" e convive com mais de 120
 * usos de cor primitiva. Aqui a regra nasce bloqueante, quando o custo é zero.
 *
 * Duas verificações:
 *   1. valor hexadecimal ou rgb()/hsl() literal fora de app/tokens.css
 *   2. var(--token) apontando para token que não existe
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, extname } from "node:path";

const RAIZ = process.cwd();
const ARQUIVO_DE_TOKENS = join("app", "tokens.css");
const ARQUIVO_DE_PONTE = join("app", "globals.css");
/** Fonte da verdade fora do CSS: themeColor, manifest, imagem social. */
const ARQUIVO_DE_MARCA = join("lib", "brand.ts");
const PASTAS_IGNORADAS = new Set(["node_modules", ".next", ".git", "public", "dist", "coverage"]);
const EXTENSOES = new Set([".css", ".ts", ".tsx", ".js", ".jsx"]);

/** Variáveis que não declaramos: Tailwind, Radix e as fontes que next/font injeta. */
const PREFIXOS_EXTERNOS = ["--tw-", "--radix-", "--font-"];

const HEX = /#[0-9a-fA-F]{3,8}\b/g;
const FUNCAO_DE_COR = /\b(?:rgba?|hsla?|oklch|color-mix)\(/g;
const USO_DE_VAR = /var\(\s*(--[a-zA-Z0-9-]+)/g;

function listarArquivos(dir) {
  const achados = [];
  for (const nome of readdirSync(dir)) {
    if (PASTAS_IGNORADAS.has(nome)) continue;
    const caminho = join(dir, nome);
    if (statSync(caminho).isDirectory()) achados.push(...listarArquivos(caminho));
    else if (EXTENSOES.has(extname(nome))) achados.push(caminho);
  }
  return achados;
}

function tokensDeclarados() {
  const nomes = new Set();
  for (const arquivo of [ARQUIVO_DE_TOKENS, ARQUIVO_DE_PONTE]) {
    const css = readFileSync(join(RAIZ, arquivo), "utf8");
    for (const linha of css.split("\n")) {
      const m = linha.match(/^\s*(--[a-zA-Z0-9-]+)\s*:/);
      if (m) nomes.add(m[1]);
    }
  }
  return nomes;
}

const declarados = tokensDeclarados();
const problemas = [];

for (const caminho of listarArquivos(RAIZ)) {
  const rel = relative(RAIZ, caminho);
  const conteudo = readFileSync(caminho, "utf8");
  const ehArquivoDeTokens = rel === ARQUIVO_DE_TOKENS || rel === ARQUIVO_DE_MARCA;

  conteudo.split("\n").forEach((linha, i) => {
    const n = i + 1;

    if (!ehArquivoDeTokens) {
      for (const achado of linha.match(HEX) ?? []) {
        problemas.push({
          rel,
          n,
          msg: `cor literal ${achado}. Use um token semântico de app/tokens.css.`,
        });
      }
      if (FUNCAO_DE_COR.test(linha)) {
        FUNCAO_DE_COR.lastIndex = 0;
        problemas.push({
          rel,
          n,
          msg: "função de cor literal. Declare o valor em app/tokens.css e use o token.",
        });
      }
    }

    for (const m of linha.matchAll(USO_DE_VAR)) {
      const token = m[1];
      if (declarados.has(token)) continue;
      if (PREFIXOS_EXTERNOS.some((p) => token.startsWith(p))) continue;
      problemas.push({ rel, n, msg: `token inexistente: ${token}` });
    }
  });
}

if (problemas.length > 0) {
  console.error(`\nDesign tokens: ${problemas.length} problema(s).\n`);
  for (const p of problemas) console.error(`  ${p.rel}:${p.n}  ${p.msg}`);
  console.error("\nCor só existe em app/tokens.css. Componente consome token semântico.\n");
  process.exit(1);
}

console.log(`Design tokens: ok (${declarados.size} tokens declarados).`);
