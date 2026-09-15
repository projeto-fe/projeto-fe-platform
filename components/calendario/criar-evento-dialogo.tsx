"use client";

import { AlertCircle } from "lucide-react";
import * as React from "react";

import { criarExcecao, criarHorario } from "@/app/(app)/estrutura/actions";
import { Button } from "@/components/ui/button";
import { AvisoDoFormulario, Campo, CampoSelecao, GradeDeCampos } from "@/components/ui/campo";
import { CampoData } from "@/components/ui/campo-data";
import {
  Dialogo,
  DialogoAviso,
  DialogoCabecalho,
  DialogoConteudo,
  DialogoCorpo,
  DialogoDescricao,
  DialogoFechar,
  DialogoRodape,
  DialogoTitulo,
  useAcaoEmDialogo,
} from "@/components/ui/dialogo";

import { CamposDeRecorrencia } from "./campos-de-recorrencia";

type Atividade = { id: string; nome: string; area: string };
type Tipo = "recorrente" | "extra" | "cancelado";

const inicial = {};

/**
 * Criar direto no calendário, como no Google Calendar: escolhe a atividade
 * já cadastrada e diz se é recorrente, só naquele dia, ou um cancelamento
 * daquele dia. Aberto pelo clique num dia (ou horário) da grade.
 */
export function CriarEventoDialogo({
  atividades,
  aberto,
  aoMudarAberto,
  dataInicial,
  horaInicial,
}: {
  atividades: Atividade[];
  aberto: boolean;
  aoMudarAberto: (aberto: boolean) => void;
  dataInicial: string;
  horaInicial?: string;
}) {
  const [tipo, setTipo] = React.useState<Tipo>("recorrente");
  const formRef = React.useRef<HTMLFormElement>(null);

  const fechar = React.useCallback(() => {
    aoMudarAberto(false);
    formRef.current?.reset();
    setTipo("recorrente");
  }, [aoMudarAberto]);

  const horario = useAcaoEmDialogo(criarHorario, inicial, fechar);
  const excecao = useAcaoEmDialogo(criarExcecao, inicial, fechar);
  const { estado, enviar, enviando } = tipo === "recorrente" ? horario : excecao;

  const horaFimSugerida = horaInicial
    ? `${String(Number(horaInicial.slice(0, 2)) + 1).padStart(2, "0")}:${horaInicial.slice(3)}`
    : undefined;

  return (
    <Dialogo open={aberto} onOpenChange={aoMudarAberto}>
      <DialogoConteudo largura="sm">
        <form key={tipo} ref={formRef} onSubmit={enviar} className="flex min-h-0 flex-1 flex-col">
          <DialogoCabecalho>
            <DialogoTitulo>Novo na agenda</DialogoTitulo>
            <DialogoDescricao>
              Agende uma atividade já cadastrada. Criar atividade nova continua em Estrutura.
            </DialogoDescricao>
          </DialogoCabecalho>

          <DialogoCorpo>
            <GradeDeCampos>
              <CampoSelecao
                id="tipo-evento"
                name="tipo-evento"
                rotulo="O que fazer"
                colunas={12}
                value={tipo}
                onValueChange={(v) => setTipo(v as Tipo)}
                opcoes={[
                  { value: "recorrente", label: "Repetir (semanal ou mensal)" },
                  { value: "extra", label: "Só neste dia", descricao: "Fora do padrão semanal: passeio, evento especial." },
                  { value: "cancelado", label: "Cancelar este dia", descricao: "A atividade não acontece nesta data." },
                ]}
              />

              <CampoSelecao
                id="atividade-evento"
                name="atividade_id"
                rotulo="Atividade"
                colunas={12}
                obrigatorio
                opcoes={atividades.map((a) => ({ value: a.id, label: `${a.nome} (${a.area})` }))}
                placeholder="Escolher atividade"
                ajuda={atividades.length === 0 ? "Cadastre uma atividade em Estrutura antes." : undefined}
                disabled={atividades.length === 0}
              />

              {tipo === "recorrente" ? (
                <>
                  <CamposDeRecorrencia idPrefix="novo-evento" />
                  <Campo
                    id="inicio-evento"
                    name="hora_inicio"
                    rotulo="Início"
                    type="time"
                    colunas={4}
                    metadeNoCelular
                    obrigatorio
                    defaultValue={horaInicial}
                  />
                  <Campo
                    id="fim-evento"
                    name="hora_fim"
                    rotulo="Fim"
                    type="time"
                    colunas={4}
                    metadeNoCelular
                    obrigatorio
                    defaultValue={horaFimSugerida}
                  />
                  <Campo id="local-evento" name="local" rotulo="Local" colunas={4} metadeNoCelular maxLength={80} />
                </>
              ) : (
                <>
                  <input type="hidden" name="tipo" value={tipo} />
                  <CampoData
                    id="data-evento"
                    name="data"
                    rotulo="Data"
                    colunas={12}
                    obrigatorio
                    defaultValue={dataInicial}
                  />
                  {tipo === "extra" ? (
                    <>
                      <Campo id="titulo-evento" name="titulo" rotulo="Título" colunas={12} maxLength={80} placeholder="Passeio ao parque" />
                      <Campo
                        id="inicio-extra"
                        name="hora_inicio"
                        rotulo="Início"
                        type="time"
                        colunas={4}
                        metadeNoCelular
                        obrigatorio
                        defaultValue={horaInicial}
                      />
                      <Campo
                        id="fim-extra"
                        name="hora_fim"
                        rotulo="Fim"
                        type="time"
                        colunas={4}
                        metadeNoCelular
                        obrigatorio
                        defaultValue={horaFimSugerida}
                      />
                      <Campo id="local-extra" name="local" rotulo="Local" colunas={4} metadeNoCelular maxLength={80} />
                    </>
                  ) : null}
                </>
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
            <Button type="submit" loading={enviando} disabled={atividades.length === 0}>
              {tipo === "cancelado" ? "Confirmar cancelamento" : "Salvar"}
            </Button>
          </DialogoRodape>
        </form>
      </DialogoConteudo>
    </Dialogo>
  );
}
