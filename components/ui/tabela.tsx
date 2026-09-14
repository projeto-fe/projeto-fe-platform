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
};

type Props<T> = {
  colunas: Coluna<T>[];
  linhas: T[];
  chaveDaLinha: (linha: T) => string;
  /** Mostrado quando não há nenhuma linha. Nunca deixe a tabela vazia e muda. */
  vazio: React.ReactNode;
};

/**
 * Tabela dirigida por definição de coluna.
 *
 * Cada coluna declara se desaparece no celular, o que resolve o caso real
 * deste produto: a mesma lista é consultada no computador da coordenação e
 * no celular do voluntário durante a atividade.
 */
export function Tabela<T>({ colunas, linhas, chaveDaLinha, vazio }: Props<T>) {
  if (linhas.length === 0) {
    return <div className="px-4 py-10 text-center text-sm text-ink-muted">{vazio}</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            {colunas.map((coluna) => (
              <th
                key={coluna.chave}
                scope="col"
                className={cn(
                  "border-b border-line bg-surface-sunken px-4 py-2.5 text-left font-display text-[0.625rem] font-semibold tracking-wider text-ink-muted uppercase",
                  coluna.numerica && "text-right",
                  coluna.escondeNoCelular && "hidden md:table-cell",
                )}
              >
                {coluna.cabecalho}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {linhas.map((linha) => (
            <tr key={chaveDaLinha(linha)} className="hover:bg-surface-sunken">
              {colunas.map((coluna) => (
                <td
                  key={coluna.chave}
                  className={cn(
                    "border-b border-line px-4 py-2.5 text-sm",
                    coluna.numerica && "text-right tabular-nums",
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
