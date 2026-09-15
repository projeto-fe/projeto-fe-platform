/** Forma do cadastro na tela, e a tradução do que vem do banco para ela. */

export type ValoresDaCrianca = {
  id?: string;
  nome_completo?: string;
  data_nascimento?: string;
  tem_problema_saude?: boolean;
  observacao_saude?: string | null;
  peso_kg?: number | null;
  altura_m?: number | null;
  numero_calcado?: number | null;
  uniforme?: string | null;
  observacoes_gerais?: string | null;
  atividades?: string[];
  sensiveis?: {
    cep?: string | null;
    logradouro?: string | null;
    numero?: string | null;
    complemento?: string | null;
    bairro?: string | null;
    cidade?: string | null;
    uf?: string | null;
    telefone_principal?: string | null;
    telefone_secundario?: string | null;
    nome_mae?: string | null;
    nome_pai?: string | null;
    autorizacao_responsavel_nome?: string | null;
    autorizacao_data?: string | null;
  } | null;
};

export type Atividade = { id: string; nome: string; area: string };

type LinhaDoBanco = {
  id: string;
  nome_completo: string;
  data_nascimento: string;
  tem_problema_saude: boolean;
  observacao_saude: string | null;
  peso_g: number | null;
  altura_cm: number | null;
  numero_calcado: number | null;
  uniforme: string | null;
  observacoes_gerais: string | null;
};

/**
 * O banco guarda inteiros (gramas, centímetros) para não depender de ponto
 * flutuante; a tela fala em quilos e metros. A conversão mora aqui, num lugar
 * só, porque duas rotas carregam o mesmo cadastro.
 */
export function montarValores(
  crianca: LinhaDoBanco,
  sensiveis: ValoresDaCrianca["sensiveis"],
  inscricoes: { atividade_id: string }[],
): ValoresDaCrianca {
  return {
    id: crianca.id,
    nome_completo: crianca.nome_completo,
    data_nascimento: crianca.data_nascimento,
    tem_problema_saude: crianca.tem_problema_saude,
    observacao_saude: crianca.observacao_saude,
    peso_kg: crianca.peso_g ? crianca.peso_g / 1000 : null,
    altura_m: crianca.altura_cm ? crianca.altura_cm / 100 : null,
    numero_calcado: crianca.numero_calcado,
    uniforme: crianca.uniforme,
    observacoes_gerais: crianca.observacoes_gerais,
    atividades: inscricoes.map((i) => i.atividade_id),
    sensiveis: sensiveis ?? null,
  };
}
