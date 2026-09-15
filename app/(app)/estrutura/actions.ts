"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { registrarAuditoria } from "@/lib/auditoria";
import { exigirPessoaLogada } from "@/lib/sessao";
import { criarClienteDoServidor } from "@/lib/supabase/server";

export type EstadoDaEstrutura = { erro?: string; sucesso?: string };

const novoNo = z.object({
  nome: z.string().trim().min(2, "Informe um nome com pelo menos duas letras.").max(80),
  parent_id: z.string().uuid().nullable(),
  tipo: z.enum(["area", "atividade"]),
  descricao_horario: z.string().trim().max(120).optional(),
});

export async function criarNo(
  _anterior: EstadoDaEstrutura,
  dados: FormData,
): Promise<EstadoDaEstrutura> {
  const pessoa = await exigirPessoaLogada();
  if (!pessoa.isAdmin) return { erro: "Apenas administradores mexem na estrutura." };

  const pai = dados.get("parent_id");
  const analise = novoNo.safeParse({
    nome: dados.get("nome"),
    parent_id: pai && pai !== "" ? pai : null,
    tipo: dados.get("tipo"),
    descricao_horario: dados.get("descricao_horario") || undefined,
  });

  if (!analise.success) {
    return { erro: analise.error.issues[0]?.message ?? "Confira os campos." };
  }

  const supabase = await criarClienteDoServidor();
  const { error } = await supabase.from("areas").insert({
    nome: analise.data.nome,
    parent_id: analise.data.parent_id,
    tipo: analise.data.tipo,
    descricao_horario: analise.data.descricao_horario ?? null,
  });

  if (error) {
    // A restrição do banco recusa atividade sem área, e é assim que essa
    // regra chega até aqui: a interface não repete a validação.
    if (error.message.includes("atividade_precisa_de_area")) {
      return { erro: "Atividade precisa estar dentro de uma área." };
    }
    return { erro: "Não foi possível criar. Tente de novo." };
  }

  revalidatePath("/estrutura");
  return {
    sucesso:
      analise.data.tipo === "area" ? "Área criada." : "Atividade criada.",
  };
}

const edicaoDoNo = z.object({
  id: z.string().uuid(),
  nome: z.string().trim().min(2, "Informe um nome com pelo menos duas letras.").max(80),
  parent_id: z.string().uuid().nullable(),
  descricao_horario: z.string().trim().max(120).optional(),
});

/** Renomear, mudar de área e (só atividade) o texto livre de horário. */
export async function editarNo(
  _anterior: EstadoDaEstrutura,
  dados: FormData,
): Promise<EstadoDaEstrutura> {
  const pessoa = await exigirPessoaLogada();
  if (!pessoa.isAdmin) return { erro: "Apenas administradores mexem na estrutura." };

  const pai = dados.get("parent_id");
  const analise = edicaoDoNo.safeParse({
    id: dados.get("id"),
    nome: dados.get("nome"),
    parent_id: pai && pai !== "" ? pai : null,
    descricao_horario: dados.get("descricao_horario") || undefined,
  });

  if (!analise.success) {
    return { erro: analise.error.issues[0]?.message ?? "Confira os campos." };
  }

  const supabase = await criarClienteDoServidor();
  const { error } = await supabase
    .from("areas")
    .update({
      nome: analise.data.nome,
      parent_id: analise.data.parent_id,
      descricao_horario: analise.data.descricao_horario ?? null,
    })
    .eq("id", analise.data.id);

  if (error) {
    if (error.message.includes("atividade_precisa_de_area")) {
      return { erro: "Atividade precisa estar dentro de uma área." };
    }
    if (error.message.includes("mesma") || error.message.includes("ciclo")) {
      return { erro: "Não dá para mover para dentro da própria descendência." };
    }
    return { erro: "Não foi possível salvar. Tente de novo." };
  }

  revalidatePath("/estrutura");
  revalidatePath("/calendario");
  return { sucesso: "Alterações salvas." };
}

/** Desativar some da estrutura, das listas e do calendário; reativar traz de volta. */
export async function alternarAtivoDoNo(dados: FormData) {
  const pessoa = await exigirPessoaLogada();
  if (!pessoa.isAdmin) return;

  const id = String(dados.get("id"));
  const ativar = dados.get("ativar") === "sim";

  const supabase = await criarClienteDoServidor();
  const { error } = await supabase.from("areas").update({ ativo: ativar }).eq("id", id);
  if (error) return;

  await registrarAuditoria({
    atorId: pessoa.id,
    acao: ativar ? "reativou nó da estrutura" : "desativou nó da estrutura",
    entidade: "areas",
    entidadeId: id,
    detalhe: { nome: String(dados.get("nome") ?? "") },
  });

  revalidatePath("/estrutura");
  revalidatePath("/calendario");
}

/**
 * Apaga de vez. Só administrador. O próprio banco recusa apagar área com
 * filho (`parent_id ... on delete restrict`); atividade com chamada já
 * feita é bloqueada aqui, porque apagar levaria a presença junto.
 */
export async function excluirNo(dados: FormData) {
  const pessoa = await exigirPessoaLogada();
  if (!pessoa.isAdmin) return;

  const id = String(dados.get("id"));
  const supabase = await criarClienteDoServidor();

  const { count } = await supabase
    .from("chamadas")
    .select("id", { count: "exact", head: true })
    .eq("atividade_id", id);

  if ((count ?? 0) > 0) return;

  const { error } = await supabase.from("areas").delete().eq("id", id);
  if (error) return;

  await registrarAuditoria({
    atorId: pessoa.id,
    acao: "excluiu nó da estrutura",
    entidade: "areas",
    entidadeId: id,
    detalhe: { nome: String(dados.get("nome") ?? "") },
  });

  revalidatePath("/estrutura");
  revalidatePath("/calendario");
}

const vinculo = z.object({
  usuario_id: z.string().uuid("Escolha uma pessoa."),
  area_id: z.string().uuid(),
  papel: z.enum(["coordenador", "voluntario"]),
});

export async function vincularPessoa(
  _anterior: EstadoDaEstrutura,
  dados: FormData,
): Promise<EstadoDaEstrutura> {
  const pessoa = await exigirPessoaLogada();
  if (!pessoa.isAdmin) return { erro: "Apenas administradores alocam pessoas." };

  const analise = vinculo.safeParse({
    usuario_id: dados.get("usuario_id"),
    area_id: dados.get("area_id"),
    papel: dados.get("papel"),
  });

  if (!analise.success) {
    return { erro: analise.error.issues[0]?.message ?? "Confira os campos." };
  }

  const supabase = await criarClienteDoServidor();
  const { error } = await supabase
    .from("area_membros")
    .upsert(analise.data, { onConflict: "usuario_id,area_id" });

  if (error) return { erro: "Não foi possível vincular. Tente de novo." };

  revalidatePath("/estrutura");
  return { sucesso: "Pessoa vinculada." };
}

export async function desvincularPessoa(dados: FormData) {
  const pessoa = await exigirPessoaLogada();
  if (!pessoa.isAdmin) return;

  const usuario_id = String(dados.get("usuario_id"));
  const area_id = String(dados.get("area_id"));

  const supabase = await criarClienteDoServidor();
  await supabase.from("area_membros").delete().eq("usuario_id", usuario_id).eq("area_id", area_id);

  revalidatePath("/estrutura");
}

const novoHorario = z
  .object({
    atividade_id: z.string().uuid(),
    frequencia: z.enum(["semanal", "mensal_dia_fixo", "mensal_ordinal"]),
    dia_semana: z.coerce.number().int().min(0).max(6).optional(),
    dia_do_mes: z.coerce.number().int().min(1).max(31).optional(),
    semana_do_mes: z.coerce.number().int().min(-1).max(4).optional(),
    hora_inicio: z.string().regex(/^\d{2}:\d{2}$/, "Informe um horário válido."),
    hora_fim: z.string().regex(/^\d{2}:\d{2}$/, "Informe um horário válido."),
    local: z.string().trim().max(80).optional(),
  })
  .refine(
    (d) => {
      if (d.frequencia === "semanal") return d.dia_semana !== undefined;
      if (d.frequencia === "mensal_dia_fixo") return d.dia_do_mes !== undefined;
      return d.dia_semana !== undefined && d.semana_do_mes !== undefined && d.semana_do_mes !== 0;
    },
    { message: "Confira os campos da recorrência." },
  );

export async function criarHorario(
  _anterior: EstadoDaEstrutura,
  dados: FormData,
): Promise<EstadoDaEstrutura> {
  const pessoa = await exigirPessoaLogada();
  if (!pessoa.isAdmin) return { erro: "Apenas administradores mexem no cronograma." };

  const analise = novoHorario.safeParse({
    atividade_id: dados.get("atividade_id"),
    frequencia: dados.get("frequencia"),
    dia_semana: dados.get("dia_semana") || undefined,
    dia_do_mes: dados.get("dia_do_mes") || undefined,
    semana_do_mes: dados.get("semana_do_mes") || undefined,
    hora_inicio: dados.get("hora_inicio"),
    hora_fim: dados.get("hora_fim"),
    local: dados.get("local") || undefined,
  });

  if (!analise.success) {
    return { erro: analise.error.issues[0]?.message ?? "Confira os campos." };
  }

  if (analise.data.hora_fim <= analise.data.hora_inicio) {
    return { erro: "O horário final precisa vir depois do inicial." };
  }

  const semanal = analise.data.frequencia === "semanal";
  const mensalDiaFixo = analise.data.frequencia === "mensal_dia_fixo";

  const supabase = await criarClienteDoServidor();
  const { error } = await supabase.from("atividade_horarios").insert({
    atividade_id: analise.data.atividade_id,
    frequencia: analise.data.frequencia,
    dia_semana: mensalDiaFixo ? null : (analise.data.dia_semana ?? null),
    dia_do_mes: mensalDiaFixo ? (analise.data.dia_do_mes ?? null) : null,
    semana_do_mes: semanal || mensalDiaFixo ? null : (analise.data.semana_do_mes ?? null),
    hora_inicio: analise.data.hora_inicio,
    hora_fim: analise.data.hora_fim,
    local: analise.data.local ?? null,
  });

  if (error) return { erro: "Não foi possível criar o horário. Tente de novo." };

  revalidatePath("/estrutura");
  revalidatePath("/calendario");
  return { sucesso: "Horário adicionado." };
}

export async function removerHorario(dados: FormData) {
  const pessoa = await exigirPessoaLogada();
  if (!pessoa.isAdmin) return;

  const supabase = await criarClienteDoServidor();
  await supabase.from("atividade_horarios").delete().eq("id", String(dados.get("id")));

  revalidatePath("/estrutura");
  revalidatePath("/calendario");
}

const novaExcecao = z.object({
  atividade_id: z.string().uuid(),
  data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Informe uma data válida."),
  tipo: z.enum(["extra", "cancelado"]),
  hora_inicio: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  hora_fim: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  titulo: z.string().trim().max(80).optional(),
  local: z.string().trim().max(80).optional(),
});

export async function criarExcecao(
  _anterior: EstadoDaEstrutura,
  dados: FormData,
): Promise<EstadoDaEstrutura> {
  const pessoa = await exigirPessoaLogada();

  const pai = dados.get("atividade_id");
  const analise = novaExcecao.safeParse({
    atividade_id: pai,
    data: dados.get("data"),
    tipo: dados.get("tipo"),
    hora_inicio: dados.get("hora_inicio") || undefined,
    hora_fim: dados.get("hora_fim") || undefined,
    titulo: dados.get("titulo") || undefined,
    local: dados.get("local") || undefined,
  });

  if (!analise.success) {
    return { erro: analise.error.issues[0]?.message ?? "Confira os campos." };
  }

  if (analise.data.tipo === "extra" && !(analise.data.hora_inicio && analise.data.hora_fim)) {
    return { erro: "Evento extra precisa de horário de início e fim." };
  }
  if (
    analise.data.hora_inicio &&
    analise.data.hora_fim &&
    analise.data.hora_fim <= analise.data.hora_inicio
  ) {
    return { erro: "O horário final precisa vir depois do inicial." };
  }

  const supabase = await criarClienteDoServidor();
  const { error } = await supabase.from("atividade_eventos").insert({
    atividade_id: analise.data.atividade_id,
    data: analise.data.data,
    tipo: analise.data.tipo,
    hora_inicio: analise.data.tipo === "extra" ? analise.data.hora_inicio : null,
    hora_fim: analise.data.tipo === "extra" ? analise.data.hora_fim : null,
    titulo: analise.data.titulo ?? null,
    local: analise.data.local ?? null,
    criado_por: pessoa.id,
  });

  if (error) {
    if (error.message.includes("row-level security")) {
      return { erro: "Apenas coordenação ou administração registra exceção." };
    }
    return { erro: "Não foi possível registrar. Tente de novo." };
  }

  revalidatePath("/estrutura");
  revalidatePath("/calendario");
  return {
    sucesso: analise.data.tipo === "cancelado" ? "Data cancelada." : "Evento extra criado.",
  };
}

export async function removerExcecao(dados: FormData) {
  await exigirPessoaLogada();

  const supabase = await criarClienteDoServidor();
  await supabase.from("atividade_eventos").delete().eq("id", String(dados.get("id")));

  revalidatePath("/estrutura");
  revalidatePath("/calendario");
}
