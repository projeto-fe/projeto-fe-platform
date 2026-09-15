/**
 * Só funções puras aqui: datas, recorrência, cruzamento de horário com
 * exceção. Nada que toque o Supabase — isso fica em `lib/calendario-dados.ts`
 * — porque a grade do calendário é Client Component e importa este arquivo
 * diretamente; misturar os dois vazaria `next/headers` pro navegador.
 */

export type FrequenciaDeHorario = "semanal" | "mensal_dia_fixo" | "mensal_ordinal";

export type HorarioRecorrente = {
  id: string;
  atividade_id: string;
  atividade_nome: string;
  area_nome: string | null;
  frequencia: FrequenciaDeHorario;
  dia_semana: number | null;
  dia_do_mes: number | null;
  /** 1 a 4 = primeira à quarta ocorrência do mês, -1 = última. */
  semana_do_mes: number | null;
  hora_inicio: string;
  hora_fim: string;
  local: string | null;
};

export type EventoDeAtividade = {
  id: string;
  atividade_id: string;
  atividade_nome: string;
  area_nome: string | null;
  data: string;
  tipo: "extra" | "cancelado";
  hora_inicio: string | null;
  hora_fim: string | null;
  titulo: string | null;
  local: string | null;
};

export type OcorrenciaDoDia = {
  atividadeId: string;
  atividadeNome: string;
  areaNome: string | null;
  horaInicio: string | null;
  horaFim: string | null;
  local: string | null;
  titulo: string | null;
};

export function paraIso(data: Date) {
  return data.toISOString().slice(0, 10);
}

/** Lê "2026-10-05" (ou nada, que vira hoje) como Date em UTC. */
export function dataReferenciaDoParametro(data?: string): Date {
  if (data && /^\d{4}-\d{2}-\d{2}$/.test(data)) {
    const [ano, mes, dia] = data.split("-").map(Number);
    return new Date(Date.UTC(ano, mes - 1, dia));
  }
  const hoje = new Date();
  return new Date(Date.UTC(hoje.getUTCFullYear(), hoje.getUTCMonth(), hoje.getUTCDate()));
}

export function diaAdjacente(referencia: Date, delta: number) {
  const proximo = new Date(referencia);
  proximo.setUTCDate(proximo.getUTCDate() + delta);
  return proximo;
}

/** Domingo a sábado da semana que contém a referência. */
export function intervaloDaSemana(referencia: Date) {
  const inicio = new Date(referencia);
  inicio.setUTCDate(inicio.getUTCDate() - inicio.getUTCDay());
  const fim = new Date(inicio);
  fim.setUTCDate(fim.getUTCDate() + 6);
  return { inicio, fim, inicioIso: paraIso(inicio), fimIso: paraIso(fim) };
}

export function nomeDoDia(referencia: Date) {
  const nome = referencia.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    timeZone: "UTC",
  });
  return nome.charAt(0).toUpperCase() + nome.slice(1);
}

export function nomeDaSemana(inicio: Date, fim: Date) {
  const formato: Intl.DateTimeFormatOptions = { day: "2-digit", month: "short", timeZone: "UTC" };
  return `${inicio.toLocaleDateString("pt-BR", formato)} – ${fim.toLocaleDateString("pt-BR", formato)}`;
}

function ultimoDiaDoMes(data: Date) {
  return new Date(Date.UTC(data.getUTCFullYear(), data.getUTCMonth() + 1, 0)).getUTCDate();
}

/** Em que ocorrência do mês este dia da semana está: 1ª, 2ª, 3ª, 4ª ou 5ª. */
function ocorrenciaDoDiaNoMes(data: Date) {
  return Math.ceil(data.getUTCDate() / 7);
}

function ehAUltimaOcorrenciaDoDiaSemanaNoMes(data: Date) {
  return data.getUTCDate() + 7 > ultimoDiaDoMes(data);
}

/** O horário recorrente cai nesta data? Cobre os três padrões de frequência. */
export function horarioOcorreEm(horario: HorarioRecorrente, data: Date): boolean {
  switch (horario.frequencia) {
    case "semanal":
      return horario.dia_semana === data.getUTCDay();
    case "mensal_dia_fixo":
      return horario.dia_do_mes === data.getUTCDate();
    case "mensal_ordinal": {
      if (horario.dia_semana !== data.getUTCDay()) return false;
      if (horario.semana_do_mes === -1) return ehAUltimaOcorrenciaDoDiaSemanaNoMes(data);
      return horario.semana_do_mes === ocorrenciaDoDiaNoMes(data);
    }
  }
}

/** Primeiro e último dia do mês de referência, em UTC para não sofrer de fuso. */
export function intervaloDoMes(referencia: Date) {
  const ano = referencia.getUTCFullYear();
  const mes = referencia.getUTCMonth();
  const inicio = new Date(Date.UTC(ano, mes, 1));
  const fim = new Date(Date.UTC(ano, mes + 1, 0));
  return { inicio, fim, inicioIso: paraIso(inicio), fimIso: paraIso(fim) };
}

/**
 * Todos os dias a desenhar numa grade de mês, do domingo antes do dia 1 ao
 * sábado depois do último dia, para a grade fechar em semanas completas.
 */
export function diasDaGrade(referencia: Date): { data: Date; noMes: boolean }[] {
  const { inicio, fim } = intervaloDoMes(referencia);
  const mes = referencia.getUTCMonth();

  const primeiroDaGrade = new Date(inicio);
  primeiroDaGrade.setUTCDate(primeiroDaGrade.getUTCDate() - primeiroDaGrade.getUTCDay());

  const ultimoDaGrade = new Date(fim);
  ultimoDaGrade.setUTCDate(ultimoDaGrade.getUTCDate() + (6 - ultimoDaGrade.getUTCDay()));

  const dias: { data: Date; noMes: boolean }[] = [];
  const cursor = new Date(primeiroDaGrade);
  while (cursor <= ultimoDaGrade) {
    dias.push({ data: new Date(cursor), noMes: cursor.getUTCMonth() === mes });
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return dias;
}

/** Lê "2026-10" (ou nada, que vira o mês corrente) como o primeiro dia do mês. */
export function mesReferenciaDoParametro(mes?: string): Date {
  if (mes && /^\d{4}-\d{2}$/.test(mes)) {
    const [ano, m] = mes.split("-").map(Number);
    return new Date(Date.UTC(ano, m - 1, 1));
  }
  const hoje = new Date();
  return new Date(Date.UTC(hoje.getUTCFullYear(), hoje.getUTCMonth(), 1));
}

/**
 * Cruza o cronograma recorrente com as exceções do período e devolve, por
 * data (chave "AAAA-MM-DD"), a lista de ocorrências daquele dia. Cancelar
 * suprime a ocorrência recorrente sem apagar o horário; evento extra soma.
 */
export function montarAgenda(
  inicio: Date,
  fim: Date,
  horarios: HorarioRecorrente[],
  eventos: EventoDeAtividade[],
): Map<string, OcorrenciaDoDia[]> {
  const canceladosPorData = new Map<string, Set<string>>();
  const extrasPorData = new Map<string, OcorrenciaDoDia[]>();

  for (const evento of eventos) {
    if (evento.tipo === "cancelado") {
      const conjunto = canceladosPorData.get(evento.data) ?? new Set<string>();
      conjunto.add(evento.atividade_id);
      canceladosPorData.set(evento.data, conjunto);
    } else {
      const lista = extrasPorData.get(evento.data) ?? [];
      lista.push({
        atividadeId: evento.atividade_id,
        atividadeNome: evento.atividade_nome,
        areaNome: evento.area_nome,
        horaInicio: evento.hora_inicio,
        horaFim: evento.hora_fim,
        local: evento.local,
        titulo: evento.titulo,
      });
      extrasPorData.set(evento.data, lista);
    }
  }

  const agenda = new Map<string, OcorrenciaDoDia[]>();
  const cursor = new Date(inicio);
  while (cursor <= fim) {
    const iso = paraIso(cursor);
    const cancelados = canceladosPorData.get(iso);

    const doDia: OcorrenciaDoDia[] = horarios
      .filter((h) => horarioOcorreEm(h, cursor) && !cancelados?.has(h.atividade_id))
      .map((h) => ({
        atividadeId: h.atividade_id,
        atividadeNome: h.atividade_nome,
        areaNome: h.area_nome,
        horaInicio: h.hora_inicio,
        horaFim: h.hora_fim,
        local: h.local,
        titulo: null,
      }));

    doDia.push(...(extrasPorData.get(iso) ?? []));
    doDia.sort((a, b) => (a.horaInicio ?? "").localeCompare(b.horaInicio ?? ""));

    if (doDia.length > 0) agenda.set(iso, doDia);
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return agenda;
}

export function parametroDoMes(referencia: Date) {
  return `${referencia.getUTCFullYear()}-${String(referencia.getUTCMonth() + 1).padStart(2, "0")}`;
}

export function mesAdjacente(referencia: Date, delta: number) {
  return new Date(Date.UTC(referencia.getUTCFullYear(), referencia.getUTCMonth() + delta, 1));
}

export function nomeDoMes(referencia: Date) {
  const nome = referencia.toLocaleDateString("pt-BR", { month: "long", year: "numeric", timeZone: "UTC" });
  return nome.charAt(0).toUpperCase() + nome.slice(1);
}

