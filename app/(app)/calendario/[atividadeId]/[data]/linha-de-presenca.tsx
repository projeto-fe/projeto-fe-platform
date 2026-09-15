"use client";

import * as React from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Iniciais } from "@/components/ui/iniciais";
import { cn } from "@/lib/utils";

import { lancarPresenca } from "./actions";

type Status = "presente" | "falta" | "falta_justificada";

const OPCOES: { valor: Status; rotulo: string; tomAtivo: string }[] = [
  { valor: "presente", rotulo: "Presente", tomAtivo: "border-positive bg-positive-soft text-positive-strong" },
  { valor: "falta", rotulo: "Falta", tomAtivo: "border-negative bg-negative-soft text-negative-strong" },
  { valor: "falta_justificada", rotulo: "Justificada", tomAtivo: "border-warning bg-warning-soft text-warning-strong" },
];

export function LinhaDePresenca({
  nome,
  atividadeId,
  data,
  criancaId,
  usuarioId,
  statusInicial,
}: {
  nome: string;
  atividadeId: string;
  data: string;
  criancaId?: string;
  usuarioId?: string;
  statusInicial?: Status;
}) {
  const [status, setStatus] = React.useState<Status | undefined>(statusInicial);
  const [enviando, iniciar] = React.useTransition();

  function marcar(valor: Status) {
    const anterior = status;
    setStatus(valor);
    iniciar(async () => {
      const dados = new FormData();
      dados.set("atividade_id", atividadeId);
      dados.set("data", data);
      if (criancaId) dados.set("crianca_id", criancaId);
      if (usuarioId) dados.set("usuario_id", usuarioId);
      dados.set("status", valor);

      const resultado = await lancarPresenca({}, dados);
      if (resultado.erro) {
        setStatus(anterior);
        toast.error(resultado.erro);
      }
    });
  }

  return (
    <li className="flex items-center gap-3 rounded-md border border-line bg-surface-raised px-3.5 py-2.5">
      <Iniciais nome={nome} tamanho="sm" />
      <span className="min-w-0 flex-1 truncate text-sm font-semibold">{nome}</span>
      <div className="flex shrink-0 gap-1.5">
        {OPCOES.map((opcao) => (
          <Button
            key={opcao.valor}
            type="button"
            variant="outline"
            size="sm"
            disabled={enviando}
            onClick={() => marcar(opcao.valor)}
            className={cn(status === opcao.valor && opcao.tomAtivo)}
          >
            {opcao.rotulo}
          </Button>
        ))}
      </div>
    </li>
  );
}
