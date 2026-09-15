import {
  intervaloDoMes,
  montarAgenda,
  paraIso,
  type EventoDeAtividade,
  type HorarioRecorrente,
} from "@/lib/calendario";
import { criarClienteAdministrativo, criarClienteDoServidor } from "@/lib/supabase/server";

/**
 * Tudo neste arquivo toca o Supabase, por isso importa `next/headers`
 * (via `lib/supabase/server`). Fica separado de `lib/calendario.ts`, que é
 * puro, porque um componente de cliente (a grade do calendário) importa as
 * funções puras diretamente — se estivessem no mesmo arquivo, o código de
 * servidor vazaria pro bundle do navegador.
 */

async function buscarHorariosEEventos(
  supabase: Awaited<ReturnType<typeof criarClienteDoServidor>> | ReturnType<typeof criarClienteAdministrativo>,
  inicioIso: string,
  fimIso: string,
) {
  const [horarios, eventos] = await Promise.all([
    supabase.from("agenda_horarios").select("*"),
    supabase.from("agenda_eventos").select("*").gte("data", inicioIso).lte("data", fimIso),
  ]);

  return {
    horarios: (horarios.data ?? []) as HorarioRecorrente[],
    eventos: (eventos.data ?? []) as EventoDeAtividade[],
  };
}

/** Agenda de um intervalo qualquer para quem está logado: respeita RLS. */
export async function carregarAgendaInternaEntre(inicio: Date, fim: Date) {
  const supabase = await criarClienteDoServidor();
  const { horarios, eventos } = await buscarHorariosEEventos(supabase, paraIso(inicio), paraIso(fim));
  return montarAgenda(inicio, fim, horarios, eventos);
}

/** Agenda do mês para quem está logado: respeita RLS via cliente do servidor. */
export async function carregarAgendaInterna(referencia: Date) {
  const { inicio, fim } = intervaloDoMes(referencia);
  return carregarAgendaInternaEntre(inicio, fim);
}

/** Agenda do mês para a página pública: cliente administrativo contra a view restrita. */
export async function carregarAgendaPublica(referencia: Date) {
  const { inicio, fim, inicioIso, fimIso } = intervaloDoMes(referencia);
  const supabase = criarClienteAdministrativo();
  const { horarios, eventos } = await buscarHorariosEEventos(supabase, inicioIso, fimIso);
  return montarAgenda(inicio, fim, horarios, eventos);
}

export type FrequenciaPorAtividade = {
  atividadeId: string;
  atividadeNome: string;
  totalChamadas: number;
  presencas: number;
};

/**
 * Frequência de uma pessoa (criança ou voluntário) por atividade. Some só
 * o que a RLS deixa a pessoa que consulta enxergar: sem vínculo com a área,
 * a atividade nem aparece aqui (Spec 0005).
 */
async function carregarFrequencia(
  filtro: { crianca_id: string } | { usuario_id: string },
): Promise<FrequenciaPorAtividade[]> {
  const supabase = await criarClienteDoServidor();
  const coluna = "crianca_id" in filtro ? "crianca_id" : "usuario_id";
  const valor = "crianca_id" in filtro ? filtro.crianca_id : filtro.usuario_id;

  const minhasPresencas = await supabase
    .from("presencas")
    .select("chamada_id, atividade_id, status")
    .eq(coluna, valor);

  const atividadeIds = [...new Set((minhasPresencas.data ?? []).map((p) => p.atividade_id))];
  if (atividadeIds.length === 0) return [];

  const [chamadas, atividades] = await Promise.all([
    supabase.from("chamadas").select("id, atividade_id").in("atividade_id", atividadeIds),
    supabase.from("areas").select("id, nome").in("id", atividadeIds),
  ]);

  const nomePorAtividade = new Map((atividades.data ?? []).map((a) => [a.id, a.nome]));
  const totalPorAtividade = new Map<string, number>();
  for (const c of chamadas.data ?? []) {
    totalPorAtividade.set(c.atividade_id, (totalPorAtividade.get(c.atividade_id) ?? 0) + 1);
  }

  const presentesPorAtividade = new Map<string, number>();
  for (const p of minhasPresencas.data ?? []) {
    if (p.status !== "presente") continue;
    presentesPorAtividade.set(p.atividade_id, (presentesPorAtividade.get(p.atividade_id) ?? 0) + 1);
  }

  return atividadeIds.map((id) => ({
    atividadeId: id,
    atividadeNome: nomePorAtividade.get(id) ?? "Atividade removida",
    totalChamadas: totalPorAtividade.get(id) ?? 0,
    presencas: presentesPorAtividade.get(id) ?? 0,
  }));
}

export function carregarFrequenciaDaCrianca(criancaId: string) {
  return carregarFrequencia({ crianca_id: criancaId });
}

export function carregarFrequenciaDoVoluntario(usuarioId: string) {
  return carregarFrequencia({ usuario_id: usuarioId });
}
