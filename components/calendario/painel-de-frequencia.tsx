import { CalendarCheck } from "lucide-react";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { EstadoVazio } from "@/components/ui/estado-vazio";
import type { FrequenciaPorAtividade } from "@/lib/calendario-dados";

/** Frequência por atividade: quantas chamadas houve, quantas foram presença. */
export function PainelDeFrequencia({ frequencia }: { frequencia: FrequenciaPorAtividade[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Frequência</CardTitle>
      </CardHeader>

      {frequencia.length === 0 ? (
        <EstadoVazio
          compacto
          icone={CalendarCheck}
          titulo="Nenhuma chamada registrada ainda"
          descricao="A frequência aparece aqui assim que alguém fizer a chamada de uma atividade."
        />
      ) : (
        <ul className="flex flex-col gap-2 p-4 pt-0">
          {frequencia.map((f) => {
            const percentual = f.totalChamadas > 0 ? Math.round((f.presencas / f.totalChamadas) * 100) : 0;
            return (
              <li
                key={f.atividadeId}
                className="flex items-center gap-3 rounded-md border border-line bg-surface-raised px-3.5 py-2.5"
              >
                <span className="min-w-0 flex-1 truncate text-sm font-semibold">{f.atividadeNome}</span>
                <span className="shrink-0 text-xs text-ink-muted">
                  {f.presencas} de {f.totalChamadas}
                </span>
                <span className="w-11 shrink-0 text-right text-sm font-semibold">{percentual}%</span>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
