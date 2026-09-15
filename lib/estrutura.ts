import { criarClienteDoServidor } from "@/lib/supabase/server";

export type HorarioDaAtividade = {
  id: string;
  frequencia: "semanal" | "mensal_dia_fixo" | "mensal_ordinal";
  dia_semana: number | null;
  dia_do_mes: number | null;
  semana_do_mes: number | null;
  hora_inicio: string;
  hora_fim: string;
  local: string | null;
};

export type NoDaEstrutura = {
  id: string;
  nome: string;
  parent_id: string | null;
  tipo: "area" | "atividade";
  descricao_horario: string | null;
  ativo: boolean;
  filhos: NoDaEstrutura[];
  inscritos: number;
  membros: { usuario_id: string; nome: string; papel: "coordenador" | "voluntario" }[];
  /** Cronograma recorrente. Só populado em nó do tipo atividade. */
  horarios: HorarioDaAtividade[];
  /** Já teve chamada feita. Excluir de vez apagaria a presença junto (Spec 0005). */
  temHistoricoDePresenca: boolean;
};

/**
 * Monta a árvore de áreas com membros e contagem de inscritos.
 *
 * São quatro consultas em vez de uma por nó: na escala deste projeto
 * (dezenas de áreas) isso é mais simples de ler e mais rápido do que
 * qualquer alternativa esperta.
 */
export async function carregarEstrutura(): Promise<NoDaEstrutura[]> {
  const supabase = await criarClienteDoServidor();

  const [areas, vinculos, pessoas, inscricoes, horarios, chamadas] = await Promise.all([
    // Ativas primeiro, desativada afunda pro fim da lista dos irmãos dela,
    // sempre visível com a etiqueta e o "Reativar" ali do lado — sem tela
    // separada nem alternância pra achar de novo.
    supabase
      .from("areas")
      .select("id, nome, parent_id, tipo, descricao_horario, ativo")
      .order("ativo", { ascending: false })
      .order("nome"),
    supabase.from("area_membros").select("usuario_id, area_id, papel"),
    supabase.from("perfis").select("id, nome").eq("ativo", true),
    supabase.from("crianca_atividades").select("atividade_id"),
    supabase
      .from("atividade_horarios")
      .select("id, atividade_id, frequencia, dia_semana, dia_do_mes, semana_do_mes, hora_inicio, hora_fim, local")
      .eq("ativo", true),
    supabase.from("chamadas").select("atividade_id"),
  ]);

  const nomePorPessoa = new Map((pessoas.data ?? []).map((p) => [p.id, p.nome]));

  const inscritosPorAtividade = new Map<string, number>();
  for (const inscricao of inscricoes.data ?? []) {
    const atual = inscritosPorAtividade.get(inscricao.atividade_id) ?? 0;
    inscritosPorAtividade.set(inscricao.atividade_id, atual + 1);
  }

  const porArea = new Map<string, NoDaEstrutura["membros"]>();
  for (const vinculo of vinculos.data ?? []) {
    const lista = porArea.get(vinculo.area_id) ?? [];
    lista.push({
      usuario_id: vinculo.usuario_id,
      nome: nomePorPessoa.get(vinculo.usuario_id) ?? "Pessoa removida",
      papel: vinculo.papel,
    });
    porArea.set(vinculo.area_id, lista);
  }

  const horariosPorAtividade = new Map<string, HorarioDaAtividade[]>();
  for (const horario of horarios.data ?? []) {
    const lista = horariosPorAtividade.get(horario.atividade_id) ?? [];
    lista.push(horario);
    horariosPorAtividade.set(horario.atividade_id, lista);
  }

  const atividadesComChamada = new Set((chamadas.data ?? []).map((c) => c.atividade_id));

  const nos = new Map<string, NoDaEstrutura>();
  for (const area of areas.data ?? []) {
    nos.set(area.id, {
      ...area,
      filhos: [],
      inscritos: inscritosPorAtividade.get(area.id) ?? 0,
      // coordenador primeiro, depois ordem alfabética
      membros: (porArea.get(area.id) ?? []).sort((a, b) =>
        a.papel === b.papel ? a.nome.localeCompare(b.nome) : a.papel === "coordenador" ? -1 : 1,
      ),
      horarios: horariosPorAtividade.get(area.id) ?? [],
      temHistoricoDePresenca: atividadesComChamada.has(area.id),
    });
  }

  const raizes: NoDaEstrutura[] = [];
  for (const no of nos.values()) {
    if (no.parent_id) nos.get(no.parent_id)?.filhos.push(no);
    else raizes.push(no);
  }

  return raizes;
}

/**
 * Só as folhas ATIVAS onde uma criança pode se inscrever. `carregarEstrutura`
 * traz também as desativadas (pra árvore mostrar e reativar), então quem usa
 * a lista pra um seletor de "escolher atividade" filtra aqui.
 */
export function listarAtividades(raizes: NoDaEstrutura[]) {
  const achadas: { id: string; nome: string; area: string }[] = [];

  function andar(no: NoDaEstrutura, nomeDaArea: string) {
    if (!no.ativo) return;
    if (no.tipo === "atividade") achadas.push({ id: no.id, nome: no.nome, area: nomeDaArea });
    for (const filho of no.filhos) andar(filho, no.tipo === "area" ? no.nome : nomeDaArea);
  }

  for (const raiz of raizes) andar(raiz, raiz.nome);
  return achadas;
}

/**
 * Todas as áreas ATIVAS, em qualquer profundidade, com o caminho no nome
 * ("Educacional / Inglês"). Serve para os seletores de "dentro de qual
 * área": mover ou criar dentro de um ramo desativado não é opção.
 */
export function listarAreas(raizes: NoDaEstrutura[]) {
  const achadas: { id: string; nome: string }[] = [];
  function andar(no: NoDaEstrutura, prefixo: string) {
    if (no.tipo !== "area" || !no.ativo) return;
    const nome = prefixo ? `${prefixo} / ${no.nome}` : no.nome;
    achadas.push({ id: no.id, nome });
    for (const filho of no.filhos) andar(filho, nome);
  }
  for (const raiz of raizes) andar(raiz, "");
  return achadas;
}

/** Acha um nó pelo id e devolve também o caminho de ancestrais (raiz primeiro). */
export function encontrarNo(
  raizes: NoDaEstrutura[],
  id: string,
): { no: NoDaEstrutura; caminho: NoDaEstrutura[] } | null {
  function andar(nos: NoDaEstrutura[], caminho: NoDaEstrutura[]): { no: NoDaEstrutura; caminho: NoDaEstrutura[] } | null {
    for (const no of nos) {
      if (no.id === id) return { no, caminho };
      const achado = andar(no.filhos, [...caminho, no]);
      if (achado) return achado;
    }
    return null;
  }
  return andar(raizes, []);
}
