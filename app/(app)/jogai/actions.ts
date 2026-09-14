"use server";

import { revalidatePath } from "next/cache";
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
}
