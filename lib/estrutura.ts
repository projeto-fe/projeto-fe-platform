import { criarClienteDoServidor } from "@/lib/supabase/server";

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

  const [areas, vinculos, pessoas, inscricoes] = await Promise.all([
    supabase
      .from("areas")
      .select("id, nome, parent_id, tipo, descricao_horario, ativo")
      .eq("ativo", true)
      .order("nome"),
    supabase.from("area_membros").select("usuario_id, area_id, papel"),
    supabase.from("perfis").select("id, nome").eq("ativo", true),
    supabase.from("crianca_atividades").select("atividade_id"),
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
    });
  }

  const raizes: NoDaEstrutura[] = [];
  for (const no of nos.values()) {
    if (no.parent_id) nos.get(no.parent_id)?.filhos.push(no);
    else raizes.push(no);
  }

  return raizes;
}

/** Só as folhas onde uma criança pode se inscrever. */
export function listarAtividades(raizes: NoDaEstrutura[]) {
  const achadas: { id: string; nome: string; area: string }[] = [];

  function andar(no: NoDaEstrutura, nomeDaArea: string) {
    if (no.tipo === "atividade") achadas.push({ id: no.id, nome: no.nome, area: nomeDaArea });
    for (const filho of no.filhos) andar(filho, no.tipo === "area" ? no.nome : nomeDaArea);
  }

  for (const raiz of raizes) andar(raiz, raiz.nome);
  return achadas;
}
