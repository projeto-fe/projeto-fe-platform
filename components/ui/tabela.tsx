import * as React from "react";

import { cn } from "@/lib/utils";

export type Coluna<T> = {
  chave: string;
  cabecalho: string;
  conteudo: (linha: T) => React.ReactNode;
  /** Números alinham à direita e usam algarismos de mesma largura. */
  numerica?: boolean;
  /** Coluna secundária: some no celular em vez de espremer a tabela. */
  escondeNoCelular?: boolean;
  /** Largura fixa, para colunas de ação ou etiqueta. */
  largura?: string;
};

type Props<T> = {
  colunas: Coluna<T>[];
  linhas: T[];
  chaveDaLinha: (linha: T) => string;
  /** Mostrado quando não há nenhuma linha. Nunca deixe a tabela vazia e muda. */
  vazio: React.ReactNode;
  /** Legenda para leitor de tela. */
  legenda?: string;
};

/**
 * Tabela dirigida por definição de coluna.
 *
 * Cada coluna declara se desaparece no celular, o que resolve o caso real
 * deste produto: a mesma lista é consultada no computador da coordenação e
 * no celular do voluntário durante a atividade.
 */
export function Tabela<T>({ colunas, linhas, chaveDaLinha, vazio, legenda }: Props<T>) {
  if (linhas.length === 0) {
    return <>{vazio}</>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        {legenda ? <caption className="sr-only">{legenda}</caption> : null}
        <thead>
          <tr>
            {colunas.map((coluna) => (
              <th
                key={coluna.chave}
                scope="col"
                style={coluna.largura ? { width: coluna.largura } : undefined}
                className={cn(
                  "border-b border-line px-5 py-2.5 text-left text-xs font-semibold text-ink-muted",
                  coluna.numerica && "text-right",
                  coluna.escondeNoCelular && "hidden md:table-cell",
                )}
              >
                {coluna.cabecalho}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {linhas.map((linha) => (
            <tr key={chaveDaLinha(linha)} className="transition-colors hover:bg-surface">
              {colunas.map((coluna) => (
                <td
                  key={coluna.chave}
                  className={cn(
                    "px-5 py-3 text-sm align-middle",
                    coluna.numerica && "text-right",
                    coluna.escondeNoCelular && "hidden md:table-cell",
                  )}
                >
                  {coluna.conteudo(linha)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
