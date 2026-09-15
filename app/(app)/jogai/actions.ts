"use server";

import { revalidatePath, updateTag } from "next/cache";
import { z } from "zod";

import { exigirPessoaLogada } from "@/lib/sessao";
import { criarClienteDoServidor } from "@/lib/supabase/server";

export type EstadoDoLancamento = { erro?: string; sucesso?: string };

const lancamento = z.object({
  crianca_id: z.string().uuid("Escolha uma criança."),
  motivo_id: z.string().uuid("Escolha o motivo."),
  atividade_id: z.string().uuid().nullable(),
});

export async function lancarPonto(
  _anterior: EstadoDoLancamento,
  dados: FormData,
): Promise<EstadoDoLancamento> {
  const pessoa = await exigirPessoaLogada();

  const atividade = dados.get("atividade_id");
  const analise = lancamento.safeParse({
    crianca_id: dados.get("crianca_id"),
    motivo_id: dados.get("motivo_id"),
    atividade_id: atividade && atividade !== "" ? atividade : null,
  });

  if (!analise.success) {
    return { erro: analise.error.issues[0]?.message ?? "Confira os campos." };
  }

  const supabase = await criarClienteDoServidor();

  // valor_aplicado vai como zero de propósito: um gatilho no banco substitui
  // pelo valor do catálogo. O cliente não decide quanto vale um ponto.
  const { error } = await supabase.from("pontuacao_eventos").insert({
    crianca_id: analise.data.crianca_id,
    motivo_id: analise.data.motivo_id,
    atividade_id: analise.data.atividade_id,
    valor_aplicado: 0,
    lancado_por: pessoa.id,
  });

  if (error) return { erro: "Não foi possível lançar. Tente de novo." };

  revalidatePath("/jogai");
  revalidatePath("/");
  revalidatePath("/ranking");
  updateTag("ranking");
  return { sucesso: "Ponto lançado." };
}

export async function estornarLancamento(dados: FormData) {
  const pessoa = await exigirPessoaLogada();
  if (!pessoa.isAdmin && !pessoa.coordenaAlgumaArea) return;

  const eventoId = String(dados.get("evento_id"));
  const criancaId = String(dados.get("crianca_id"));

  const supabase = await criarClienteDoServidor();

  // Estorno é um evento novo apontando para o original. O gatilho calcula o
  // valor inverso e copia a criança. Nada é apagado nem reescrito.
  await supabase.from("pontuacao_eventos").insert({
    crianca_id: criancaId,
    valor_aplicado: 0,
    lancado_por: pessoa.id,
    estorna_evento_id: eventoId,
  });

  revalidatePath("/jogai");
  revalidatePath("/");
  revalidatePath("/ranking");
  updateTag("ranking");
}

/**
 * Exclusão de verdade, só administrador (ADR 0016). Se o lançamento já tem
 * estorno, apaga os dois: a chave estrangeira do estorno não deixaria
 * apagar só o original com o estorno ainda apontando pra ele.
 */
export async function excluirLancamento(dados: FormData) {
  const pessoa = await exigirPessoaLogada();
  if (!pessoa.isAdmin) return;

  const eventoId = String(dados.get("evento_id"));
  const supabase = await criarClienteDoServidor();

  await supabase.from("pontuacao_eventos").delete().eq("estorna_evento_id", eventoId);
  await supabase.from("pontuacao_eventos").delete().eq("id", eventoId);

  revalidatePath("/jogai");
  revalidatePath("/");
  revalidatePath("/ranking");
  updateTag("ranking");
}

export type EstadoDoMotivo = { erro?: string; sucesso?: string };

const novoMotivo = z.object({
  rotulo: z.string().trim().min(2, "Informe um texto com pelo menos duas letras.").max(80),
  valor: z.coerce.number().int().refine((v) => v !== 0, "O valor não pode ser zero."),
});

/** Catálogo de motivos: só administrador mexe, e o valor nunca é zero (ADR 0003). */
export async function criarMotivo(
  _anterior: EstadoDoMotivo,
  dados: FormData,
): Promise<EstadoDoMotivo> {
  const pessoa = await exigirPessoaLogada();
  if (!pessoa.isAdmin) return { erro: "Apenas administradores mexem no catálogo de motivos." };

  const analise = novoMotivo.safeParse({
    rotulo: dados.get("rotulo"),
    valor: dados.get("valor"),
  });

  if (!analise.success) {
    return { erro: analise.error.issues[0]?.message ?? "Confira os campos." };
  }

  const supabase = await criarClienteDoServidor();
  const { count } = await supabase
    .from("motivos_pontuacao")
    .select("id", { count: "exact", head: true });

  const { error } = await supabase.from("motivos_pontuacao").insert({
    rotulo: analise.data.rotulo,
    valor: analise.data.valor,
    ordem: count ?? 0,
  });

  if (error) {
    if (error.message.includes("duplicate") || error.message.includes("unique")) {
      return { erro: "Já existe um motivo com este texto." };
    }
    return { erro: "Não foi possível criar. Tente de novo." };
  }

  revalidatePath("/jogai");
  return { sucesso: "Motivo criado." };
}

const edicaoDoMotivo = z.object({
  id: z.string().uuid(),
  rotulo: z.string().trim().min(2, "Informe um texto com pelo menos duas letras.").max(80),
  valor: z.coerce.number().int().refine((v) => v !== 0, "O valor não pode ser zero."),
});

export async function editarMotivo(
  _anterior: EstadoDoMotivo,
  dados: FormData,
): Promise<EstadoDoMotivo> {
  const pessoa = await exigirPessoaLogada();
  if (!pessoa.isAdmin) return { erro: "Apenas administradores mexem no catálogo de motivos." };

  const analise = edicaoDoMotivo.safeParse({
    id: dados.get("id"),
    rotulo: dados.get("rotulo"),
    valor: dados.get("valor"),
  });

  if (!analise.success) {
    return { erro: analise.error.issues[0]?.message ?? "Confira os campos." };
  }

  const supabase = await criarClienteDoServidor();
  const { error } = await supabase
    .from("motivos_pontuacao")
    .update({ rotulo: analise.data.rotulo, valor: analise.data.valor })
    .eq("id", analise.data.id);

  if (error) {
    if (error.message.includes("duplicate") || error.message.includes("unique")) {
      return { erro: "Já existe um motivo com este texto." };
    }
    return { erro: "Não foi possível salvar. Tente de novo." };
  }

  revalidatePath("/jogai");
  return { sucesso: "Motivo atualizado. Pontos já lançados continuam com o valor de antes." };
}

/**
 * Apaga de vez. Só administrador, e só enquanto nenhum ponto já lançado usou
 * este motivo — o banco recusaria de qualquer forma (`on delete restrict`),
 * aqui é só a mensagem amigável.
 */
export async function excluirMotivo(dados: FormData) {
  const pessoa = await exigirPessoaLogada();
  if (!pessoa.isAdmin) return;

  const id = String(dados.get("id"));
  const supabase = await criarClienteDoServidor();

  const { count } = await supabase
    .from("pontuacao_eventos")
    .select("id", { count: "exact", head: true })
    .eq("motivo_id", id);

  if ((count ?? 0) > 0) return;

  await supabase.from("motivos_pontuacao").delete().eq("id", id);

  revalidatePath("/jogai");
}
