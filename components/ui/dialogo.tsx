"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";

/**
 * Diálogo: toda tarefa de criar ou editar acontece aqui, aberta a partir de
 * um botão, e não como formulário parado no meio da tela. No celular sobe do
 * rodapé como uma folha; no desktop centraliza.
 *
 * Tarefa longa (o cadastro de criança) usa `largura="xl"` e continua tendo
 * rota própria, para o endereço poder ser compartilhado e aberto direto.
 */
export const Dialogo = DialogPrimitive.Root;
export const DialogoGatilho = DialogPrimitive.Trigger;
export const DialogoFechar = DialogPrimitive.Close;

export function DialogoConteudo({
  className,
  children,
  largura = "md",
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  largura?: "sm" | "md" | "lg" | "xl";
}) {
  const larguras = {
    sm: "sm:max-w-sm",
    md: "sm:max-w-md",
    lg: "sm:max-w-2xl",
    // Cadastro longo: duas colunas por seção precisam de espaço para caber.
    xl: "sm:max-w-4xl",
  };

  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-scrim backdrop-blur-[2px] animate-esmaecer" />
      <DialogPrimitive.Content
        className={cn(
          "fixed inset-x-0 bottom-0 z-50 flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-xl border border-line bg-surface-raised shadow-modal outline-none animate-deslizar-de-baixo",
          "sm:inset-x-auto sm:top-1/2 sm:left-1/2 sm:bottom-auto sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-lg sm:animate-surgir",
          larguras[largura],
          className,
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close
          aria-label="Fechar"
          className="absolute top-3.5 right-3.5 grid size-8 place-items-center rounded-md text-ink-subtle transition-colors hover:bg-surface-sunken hover:text-ink"
        >
          <X className="size-4" aria-hidden />
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export function DialogoCabecalho({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("flex flex-col gap-1 px-5 pt-5 pr-14", className)} {...props} />;
}

export function DialogoTitulo({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return <DialogPrimitive.Title className={cn("text-lg font-semibold tracking-tight", className)} {...props} />;
}

export function DialogoDescricao({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return <DialogPrimitive.Description className={cn("text-sm text-ink-muted", className)} {...props} />;
}

export function DialogoCorpo({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("flex-1 overflow-y-auto px-5 py-5", className)} {...props} />;
}

export function DialogoRodape({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex flex-col-reverse gap-2 border-t border-line bg-surface px-5 py-3.5 pb-[max(0.875rem,env(safe-area-inset-bottom))] sm:flex-row sm:justify-end",
        className,
      )}
      {...props}
    />
  );
}

/**
 * Diálogo que é uma rota: existe enquanto a URL existir e fecha voltando no
 * histórico. É o que sustenta abrir o cadastro de criança por cima da lista
 * (rota interceptada) sem perder o endereço compartilhável.
 */
export function DialogoDeRota({
  largura,
  children,
}: {
  largura?: "sm" | "md" | "lg" | "xl";
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [aberto, setAberto] = React.useState(true);

  function aoMudar(valor: boolean) {
    if (valor) return;
    // Anima a saída antes de desmontar; sem isto o diálogo some de um quadro
    // para o outro.
    setAberto(false);
    router.back();
  }

  return (
    <Dialogo open={aberto} onOpenChange={aoMudar}>
      <DialogoConteudo largura={largura}>{children}</DialogoConteudo>
    </Dialogo>
  );
}

/** O que toda server action de formulário devolve para a tela. */
export type EstadoDeFormulario = { erro?: string; sucesso?: string };

/**
 * Envio de formulário em diálogo: ao concluir, o aviso sai como toast, o
 * formulário limpa e o diálogo fecha. O erro fica no estado, para aparecer
 * inline, que é onde precisa ser lido com calma.
 *
 * Usa onSubmit em vez de <form action={...}> de propósito. Com `action`, o
 * React limpa os campos assim que a ação termina, inclusive quando ela
 * termina em erro: num cadastro de vinte campos isso apaga tudo que a pessoa
 * digitou e a obriga a recomeçar por causa de um nome curto demais.
 */
export function useAcaoEmDialogo(
  acao: (anterior: EstadoDeFormulario, dados: FormData) => Promise<EstadoDeFormulario>,
  inicial: EstadoDeFormulario,
  aoConcluir: () => void,
) {
  const [estado, setEstado] = React.useState(inicial);
  const [enviando, iniciar] = React.useTransition();

  function enviar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const formulario = evento.currentTarget;
    const dados = new FormData(formulario);

    iniciar(async () => {
      const resultado = await acao(estado, dados);
      setEstado(resultado);
      if (!resultado.sucesso) return;

      toast.success(resultado.sucesso);
      formulario.reset();
      aoConcluir();
    });
  }

  return { estado, enviar, enviando };
}

/**
 * Faixa de aviso presa acima do rodapé do diálogo.
 *
 * Fica fora do corpo rolável porque um erro no fim de um formulário longo é
 * um erro que ninguém vê: a pessoa clica em salvar, nada parece acontecer, e
 * a explicação está trezentos pixels abaixo.
 */
export function DialogoAviso({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("border-t border-line bg-surface-raised px-5 pt-4", className)}
      {...props}
    />
  );
}
