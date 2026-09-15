"use client";

import { AlertCircle, Plus, UserPlus } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { AvisoDoFormulario, Campo, CampoSelecao, GradeDeCampos } from "@/components/ui/campo";
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

import { criarNo, vincularPessoa, type EstadoDaEstrutura } from "./actions";

const inicial: EstadoDaEstrutura = {};

type Area = { id: string; nome: string };
type Pessoa = { id: string; nome: string };
type Tipo = "area" | "atividade";

export function NovoNoDialogo({
  areas,
  tipoInicial = "area",
  areaInicial,
  gatilho,
}: {
  areas: Area[];
  tipoInicial?: Tipo;
  areaInicial?: string;
  gatilho?: React.ReactNode;
}) {
  const [aberto, setAberto] = React.useState(false);
  const [tipo, setTipo] = React.useState<Tipo>(tipoInicial);
  const formRef = React.useRef<HTMLFormElement>(null);

  const concluir = React.useCallback(() => {
    setAberto(false);
    formRef.current?.reset();
    setTipo(tipoInicial);
  }, [tipoInicial]);
  const { estado, enviar, enviando } = useAcaoEmDialogo(criarNo, inicial, concluir);

  const semArea = areas.length === 0;
  const podeCriarAtividade = !semArea;

  return (
    <Dialogo open={aberto} onOpenChange={setAberto}>
      <DialogoGatilho asChild>
        {gatilho ?? (
          <Button>
            <Plus aria-hidden />
            Nova área
          </Button>
        )}
      </DialogoGatilho>

      <DialogoConteudo>
        <form ref={formRef} onSubmit={enviar} className="flex min-h-0 flex-1 flex-col">
          <DialogoCabecalho>
            <DialogoTitulo>{tipo === "area" ? "Nova área" : "Nova atividade"}</DialogoTitulo>
            <DialogoDescricao>
              {tipo === "area"
                ? "Área é uma frente do projeto, como Educacional ou Esportiva."
                : "Atividade é onde a criança se inscreve, dentro de uma área."}
            </DialogoDescricao>
          </DialogoCabecalho>

          <DialogoCorpo>
            <GradeDeCampos>
              <CampoSelecao
                id="tipo"
                name="tipo"
                rotulo="O que criar"
                colunas={12}
                value={tipo}
                onValueChange={(v) => setTipo(v as Tipo)}
                opcoes={[
                  { value: "area", label: "Área" },
                  {
                    value: "atividade",
                    label: "Atividade",
                    descricao: podeCriarAtividade ? undefined : "Crie uma área antes.",
                  },
                ]}
              />

              <Campo
                id="nome"
                name="nome"
                rotulo="Nome"
                colunas={12}
                obrigatorio
                maxLength={80}
                autoComplete="off"
                placeholder={tipo === "area" ? "Educacional" : "Reforço escolar"}
              />

              {tipo === "atividade" ? (
                <>
                  <CampoSelecao
                    id="parent_id"
                    name="parent_id"
                    rotulo="Dentro da área"
                    colunas={12}
                    obrigatorio
                    defaultValue={areaInicial ?? areas[0]?.id}
                    opcoes={areas.map((a) => ({ value: a.id, label: a.nome }))}
                    placeholder="Escolher área"
                  />
                  <Campo
                    id="descricao_horario"
                    name="descricao_horario"
                    rotulo="Quando acontece"
                    colunas={12}
                    maxLength={120}
                    placeholder="Seg e qua, 14h"
                    ajuda="Texto livre, só para a equipe se orientar."
                  />
                </>
              ) : (
                <input type="hidden" name="parent_id" value="" />
              )}
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
            <Button type="submit" loading={enviando} disabled={tipo === "atividade" && semArea}>
              {tipo === "area" ? "Criar área" : "Criar atividade"}
            </Button>
          </DialogoRodape>
        </form>
      </DialogoConteudo>
    </Dialogo>
  );
}

export function VincularDialogo({
  areaId,
  areaNome,
  pessoas,
  gatilho,
}: {
  areaId: string;
  areaNome: string;
  pessoas: Pessoa[];
  gatilho?: React.ReactNode;
}) {
  const [aberto, setAberto] = React.useState(false);
  const formRef = React.useRef<HTMLFormElement>(null);

  const concluir = React.useCallback(() => {
    setAberto(false);
    formRef.current?.reset();
  }, []);
  const { estado, enviar, enviando } = useAcaoEmDialogo(vincularPessoa, inicial, concluir);

  const semPessoas = pessoas.length === 0;

  return (
    <Dialogo open={aberto} onOpenChange={setAberto}>
      <DialogoGatilho asChild>
        {gatilho ?? (
          <Button variant="ghost" size="sm">
            <UserPlus aria-hidden />
            Vincular pessoa
          </Button>
        )}
      </DialogoGatilho>

      <DialogoConteudo largura="sm">
        <form ref={formRef} onSubmit={enviar} className="flex min-h-0 flex-1 flex-col">
          <input type="hidden" name="area_id" value={areaId} />

          <DialogoCabecalho>
            <DialogoTitulo>Vincular pessoa</DialogoTitulo>
            <DialogoDescricao>
              Quem coordena ou ajuda em <span className="font-semibold text-ink">{areaNome}</span>.
              O papel vale só dentro desta área.
            </DialogoDescricao>
          </DialogoCabecalho>

          <DialogoCorpo>
            <GradeDeCampos>
              <CampoSelecao
                id={`pessoa-${areaId}`}
                name="usuario_id"
                rotulo="Pessoa"
                colunas={12}
                obrigatorio
                opcoes={pessoas.map((p) => ({ value: p.id, label: p.nome }))}
                placeholder="Escolher pessoa"
                ajuda={semPessoas ? "Convide alguém em Pessoas e acessos antes." : undefined}
                disabled={semPessoas}
              />
              <CampoSelecao
                id={`papel-${areaId}`}
                name="papel"
                rotulo="Papel"
                colunas={12}
                defaultValue="voluntario"
                opcoes={[
                  { value: "voluntario", label: "Voluntário", descricao: "Cadastra crianças e lança pontos." },
                  { value: "coordenador", label: "Coordenação", descricao: "Também vê endereço, contato e autorização." },
                ]}
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
            <Button type="submit" loading={enviando} disabled={semPessoas}>
              Vincular
            </Button>
          </DialogoRodape>
        </form>
      </DialogoConteudo>
    </Dialogo>
  );
}
