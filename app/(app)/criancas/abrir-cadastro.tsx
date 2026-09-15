"use client";

import { AlertCircle, Loader2 } from "lucide-react";
import * as React from "react";

import { AvisoDoFormulario } from "@/components/ui/campo";
import {
  Dialogo,
  DialogoCabecalho,
  DialogoConteudo,
  DialogoCorpo,
  DialogoDescricao,
  DialogoGatilho,
  DialogoTitulo,
} from "@/components/ui/dialogo";

import { carregarCadastroDaCrianca } from "./actions";
import { CadastroDaCriancaEmDialogo } from "./formulario";
import type { Atividade, ValoresDaCrianca } from "./valores";

type Props = {
  /** Sem id, é cadastro novo. Com id, o cadastro é buscado ao abrir. */
  criancaId?: string;
  atividades: Atividade[];
  podeVerSensiveis: boolean;
  /** O botão ou a linha da tabela que abre o diálogo. */
  children: React.ReactNode;
};

/**
 * Abre o cadastro de criança em diálogo, a partir de qualquer gatilho.
 *
 * Ao editar, os dados só são buscados quando o diálogo abre: a lista pode ter
 * cem linhas e nenhuma delas precisa carregar endereço e telefone antes de
 * alguém clicar. As páginas `/criancas/nova` e `/criancas/[id]` continuam
 * existindo para quem chega pelo endereço direto.
 */
export function AbrirCadastro({ criancaId, atividades, podeVerSensiveis, children }: Props) {
  const [aberto, setAberto] = React.useState(false);
  const [valores, setValores] = React.useState<ValoresDaCrianca>();
  const [erro, setErro] = React.useState<string>();
  const [carregando, iniciarCarga] = React.useTransition();

  function aoMudar(proximo: boolean) {
    setAberto(proximo);
    if (!proximo || !criancaId || valores) return;

    setErro(undefined);
    iniciarCarga(async () => {
      const resultado = await carregarCadastroDaCrianca(criancaId);
      if (resultado.valores) setValores(resultado.valores);
      else setErro(resultado.erro ?? "Não foi possível abrir este cadastro.");
    });
  }

  const pronto = !criancaId || Boolean(valores);

  return (
    <Dialogo open={aberto} onOpenChange={aoMudar}>
      <DialogoGatilho asChild>{children}</DialogoGatilho>

      <DialogoConteudo largura="xl">
        {pronto ? (
          <CadastroDaCriancaEmDialogo
            valores={valores}
            atividades={atividades}
            podeVerSensiveis={podeVerSensiveis}
            aoSalvar={() => setAberto(false)}
          />
        ) : (
          <>
            <DialogoCabecalho>
              <DialogoTitulo>Cadastro da criança</DialogoTitulo>
              <DialogoDescricao>
                {erro ? "Não deu para abrir agora." : "Buscando o cadastro..."}
              </DialogoDescricao>
            </DialogoCabecalho>

            <DialogoCorpo className="grid min-h-40 place-items-center">
              {erro ? (
                <AvisoDoFormulario tom="erro" icone={<AlertCircle />}>
                  {erro}
                </AvisoDoFormulario>
              ) : (
                <Loader2
                  className="size-6 animate-spin text-ink-subtle"
                  aria-label={carregando ? "Carregando" : undefined}
                />
              )}
            </DialogoCorpo>
          </>
        )}
      </DialogoConteudo>
    </Dialogo>
  );
}
