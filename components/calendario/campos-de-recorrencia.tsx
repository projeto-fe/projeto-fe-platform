"use client";

import * as React from "react";

import { Campo, CampoSelecao, GradeDeCampos } from "@/components/ui/campo";

export const DIAS_DA_SEMANA = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

const ORDINAIS: Record<number, string> = { 1: "1ª", 2: "2ª", 3: "3ª", 4: "4ª", [-1]: "última" };

type Frequencia = "semanal" | "mensal_dia_fixo" | "mensal_ordinal";

type Horario = {
  frequencia: Frequencia;
  dia_semana: number | null;
  dia_do_mes: number | null;
  semana_do_mes: number | null;
};

/** Rótulo curto e legível de um horário recorrente, qualquer que seja o padrão. */
export function rotuloDaRecorrencia(h: Horario) {
  if (h.frequencia === "semanal" && h.dia_semana !== null) {
    return `Toda ${DIAS_DA_SEMANA[h.dia_semana].toLowerCase()}`;
  }
  if (h.frequencia === "mensal_dia_fixo" && h.dia_do_mes !== null) {
    return `Todo dia ${h.dia_do_mes} do mês`;
  }
  if (h.frequencia === "mensal_ordinal" && h.dia_semana !== null && h.semana_do_mes !== null) {
    return `${ORDINAIS[h.semana_do_mes] ?? h.semana_do_mes}ª ${DIAS_DA_SEMANA[h.dia_semana].toLowerCase()} do mês`;
  }
  return "Recorrência";
}

/**
 * Os três padrões de recorrência do calendário, no estilo Google Calendar:
 * toda semana, todo mês num dia fixo, ou todo mês num dia da semana (ex.:
 * toda terceira terça). Controla a própria exibição condicional; os campos
 * levam `name` e viajam com o form do pai normalmente.
 */
export function CamposDeRecorrencia({
  idPrefix,
  frequenciaInicial = "semanal",
  diaSemanaInicial = 1,
}: {
  idPrefix: string;
  frequenciaInicial?: Frequencia;
  diaSemanaInicial?: number;
}) {
  const [frequencia, setFrequencia] = React.useState<Frequencia>(frequenciaInicial);

  return (
    <>
      <CampoSelecao
        id={`${idPrefix}-frequencia`}
        name="frequencia"
        rotulo="Repete"
        colunas={12}
        value={frequencia}
        onValueChange={(v) => setFrequencia(v as Frequencia)}
        opcoes={[
          { value: "semanal", label: "Toda semana" },
          { value: "mensal_dia_fixo", label: "Todo mês, num dia fixo" },
          { value: "mensal_ordinal", label: "Todo mês, num dia da semana" },
        ]}
      />

      {frequencia === "semanal" ? (
        <CampoSelecao
          id={`${idPrefix}-dia-semana`}
          name="dia_semana"
          rotulo="Dia da semana"
          colunas={12}
          defaultValue={String(diaSemanaInicial)}
          opcoes={DIAS_DA_SEMANA.map((d, i) => ({ value: String(i), label: d }))}
        />
      ) : null}

      {frequencia === "mensal_dia_fixo" ? (
        <Campo
          id={`${idPrefix}-dia-mes`}
          name="dia_do_mes"
          rotulo="Dia do mês"
          type="number"
          inputMode="numeric"
          colunas={12}
          obrigatorio
          defaultValue="1"
          ajuda="Em mês sem esse dia (ex.: 31 em fevereiro), o mês é pulado."
        />
      ) : null}

      {frequencia === "mensal_ordinal" ? (
        <GradeDeCampos>
          <CampoSelecao
            id={`${idPrefix}-semana-mes`}
            name="semana_do_mes"
            rotulo="Ocorrência"
            colunas={6}
            defaultValue="1"
            opcoes={[
              { value: "1", label: "1ª" },
              { value: "2", label: "2ª" },
              { value: "3", label: "3ª" },
              { value: "4", label: "4ª" },
              { value: "-1", label: "Última" },
            ]}
          />
          <CampoSelecao
            id={`${idPrefix}-dia-semana-ordinal`}
            name="dia_semana"
            rotulo="Dia da semana"
            colunas={6}
            defaultValue={String(diaSemanaInicial)}
            opcoes={DIAS_DA_SEMANA.map((d, i) => ({ value: String(i), label: d }))}
          />
        </GradeDeCampos>
      ) : null}
    </>
  );
}
