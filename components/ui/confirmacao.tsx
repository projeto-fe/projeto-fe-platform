"use client";

import * as AlertDialog from "@radix-ui/react-alert-dialog";
import * as React from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  /** O gatilho: um botão ou ícone. Recebe o clique via Slot. */
  children: React.ReactNode;
  titulo: string;
  descricao: React.ReactNode;
  rotuloConfirmar: string;
  /** Ação destrutiva pinta o botão de confirmação em negativo. */
  perigoso?: boolean;
  /** Server action que recebe FormData. */
  acao: (dados: FormData) => Promise<void>;
  /** Campos escondidos enviados com a ação. */
  campos?: Record<string, string>;
  /** Mensagem do aviso depois que a ação conclui. */
  mensagemDeSucesso?: string;
};

/**
 * Pergunta antes de agir. Existe para toda ação que não tem "desfazer"
 * imediato: desativar acesso, cancelar convite, remover vínculo, estornar.
 * O aviso de conclusão sai daqui, para que cada tela não precise repetir.
 */
export function Confirmacao({
  children,
  titulo,
  descricao,
  rotuloConfirmar,
  perigoso = false,
  acao,
  campos = {},
  mensagemDeSucesso,
}: Props) {
  const [aberto, setAberto] = React.useState(false);
  const [enviando, iniciar] = React.useTransition();

  function confirmar() {
    const dados = new FormData();
    for (const [chave, valor] of Object.entries(campos)) dados.set(chave, valor);

    iniciar(async () => {
      try {
        await acao(dados);
        if (mensagemDeSucesso) toast.success(mensagemDeSucesso);
        setAberto(false);
      } catch {
        toast.error("Não foi possível concluir. Tente de novo.");
      }
    });
  }

  return (
    <AlertDialog.Root open={aberto} onOpenChange={setAberto}>
      <AlertDialog.Trigger asChild>{children}</AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 z-50 bg-scrim backdrop-blur-[2px] animate-esmaecer" />
        <AlertDialog.Content
          className={cn(
            "fixed inset-x-0 bottom-0 z-50 flex w-full flex-col gap-5 rounded-t-xl border border-line bg-surface-raised p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-modal outline-none animate-deslizar-de-baixo",
            "sm:inset-x-auto sm:top-1/2 sm:left-1/2 sm:bottom-auto sm:max-w-sm sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-lg sm:animate-surgir",
          )}
        >
          <div className="flex flex-col gap-1.5">
            <AlertDialog.Title className="text-lg font-semibold tracking-tight">{titulo}</AlertDialog.Title>
            <AlertDialog.Description className="text-sm leading-relaxed text-ink-muted">
              {descricao}
            </AlertDialog.Description>
          </div>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <AlertDialog.Cancel asChild>
              <Button variant="outline" disabled={enviando}>
                Voltar
              </Button>
            </AlertDialog.Cancel>
            <Button
              variant={perigoso ? "destructive" : "primary"}
              loading={enviando}
              onClick={confirmar}
            >
              {rotuloConfirmar}
            </Button>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
