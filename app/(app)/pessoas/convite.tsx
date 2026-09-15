"use client";

import { AlertCircle, UserPlus } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { AvisoDoFormulario, Campo, CampoSelecao, GradeDeCampos } from "@/components/ui/campo";
import {
  Dialogo,
  DialogoCabecalho,
  DialogoConteudo,
  DialogoAviso,
  DialogoCorpo,
  DialogoDescricao,
  DialogoFechar,
  DialogoGatilho,
  DialogoRodape,
  DialogoTitulo,
  useAcaoEmDialogo,
} from "@/components/ui/dialogo";

import { convidarPessoa, type EstadoDoConvite } from "./actions";

const inicial: EstadoDoConvite = {};

export function ConvidarDialogo({
  areas,
  gatilho,
}: {
  areas: { id: string; nome: string }[];
  gatilho?: React.ReactNode;
}) {
  const [aberto, setAberto] = React.useState(false);
  const concluir = React.useCallback(() => setAberto(false), []);
  const { estado, enviar, enviando } = useAcaoEmDialogo(convidarPessoa, inicial, concluir);

  return (
    <Dialogo open={aberto} onOpenChange={setAberto}>
      <DialogoGatilho asChild>
        {gatilho ?? (
          <Button>
            <UserPlus aria-hidden />
            Convidar pessoa
          </Button>
        )}
      </DialogoGatilho>

      <DialogoConteudo>
        <form onSubmit={enviar} className="flex min-h-0 flex-1 flex-col">
          <DialogoCabecalho>
            <DialogoTitulo>Convidar pessoa</DialogoTitulo>
            <DialogoDescricao>O convite vale 7 dias e serve uma vez só.</DialogoDescricao>
          </DialogoCabecalho>

          <DialogoCorpo>
            <GradeDeCampos>
              <Campo
                id="email"
                name="email"
                rotulo="E-mail"
                type="email"
                inputMode="email"
                autoComplete="off"
                colunas={12}
                obrigatorio
                placeholder="nome@exemplo.com"
              />
              <CampoSelecao
                id="papel"
                name="papel"
                rotulo="Papel"
                colunas={6}
                defaultValue="voluntario"
                opcoes={[
                  { value: "voluntario", label: "Voluntário" },
                  { value: "coordenador", label: "Coordenação" },
                ]}
              />
              <CampoSelecao
                id="area_id"
                name="area_id"
                rotulo="Área"
                colunas={6}
                defaultValue=""
                opcoes={[
                  { value: "", label: "Definir depois" },
                  ...areas.map((a) => ({ value: a.id, label: a.nome })),
                ]}
                ajuda={areas.length === 0 ? "Crie uma área antes." : undefined}
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
            <Button type="submit" loading={enviando}>
              Enviar convite
            </Button>
          </DialogoRodape>
        </form>
      </DialogoConteudo>
    </Dialogo>
  );
}
