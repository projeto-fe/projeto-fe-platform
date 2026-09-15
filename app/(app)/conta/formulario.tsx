"use client";

import { AlertCircle, Pencil } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { AvisoDoFormulario, Campo, GradeDeCampos } from "@/components/ui/campo";
import {
  Dialogo,
  DialogoAviso,
  DialogoCabecalho,
  DialogoConteudo,
  DialogoCorpo,
  DialogoDescricao,
  DialogoFechar,
  DialogoGatilho,
  DialogoRodape,
  DialogoTitulo,
  useAcaoEmDialogo,
} from "@/components/ui/dialogo";

import { salvarNome, type EstadoDaConta } from "./actions";

const inicial: EstadoDaConta = {};

export function BotaoDeEditarNome({ nome }: { nome: string }) {
  const [aberto, setAberto] = React.useState(false);
  const concluir = React.useCallback(() => setAberto(false), []);
  const { estado, enviar, enviando: salvando } = useAcaoEmDialogo(salvarNome, inicial, concluir);

  return (
    <Dialogo open={aberto} onOpenChange={setAberto}>
      <DialogoGatilho asChild>
        <Button variant="outline" size="sm">
          <Pencil aria-hidden />
          Editar nome
        </Button>
      </DialogoGatilho>

      <DialogoConteudo largura="sm">
        <form onSubmit={enviar} className="flex min-h-0 flex-1 flex-col">
          <DialogoCabecalho>
            <DialogoTitulo>Editar nome</DialogoTitulo>
            <DialogoDescricao>É assim que a equipe vai ver você no portal.</DialogoDescricao>
          </DialogoCabecalho>

          <DialogoCorpo>
            <GradeDeCampos>
              <Campo
                id="nome"
                name="nome"
                rotulo="Nome"
                colunas={12}
                obrigatorio
                maxLength={80}
                autoComplete="name"
                defaultValue={nome}
                erro={estado.erro}
                autoFocus
              />
            </GradeDeCampos>

          </DialogoCorpo>

          {estado.erro ? (
            <DialogoAviso>
              <AvisoDoFormulario tom="erro" icone={<AlertCircle />}>
                {estado.erro}
              </AvisoDoFormulario>
            </DialogoAviso>
          ) : null}

          <DialogoRodape>
            <DialogoFechar asChild>
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </DialogoFechar>
            <Button type="submit" loading={salvando}>
              Salvar nome
            </Button>
          </DialogoRodape>
        </form>
      </DialogoConteudo>
    </Dialogo>
  );
}
