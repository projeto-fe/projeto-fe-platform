"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { exigirPessoaLogada } from "@/lib/sessao";
import { criarClienteDoServidor } from "@/lib/supabase/server";

const lancamento = z.object({
  atividade_id: z.string().uuid(),
  data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  crianca_id: z.string().uuid().optional(),
  usuario_id: z.string().uuid().optional(),
  status: z.enum(["presente", "falta", "falta_justificada"]),
});

export type EstadoDaPresenca = { erro?: string };

/**
 * Encontra a chamada da atividade nesta data, criando na primeira vez, e
 * lança ou corrige a presença de uma pessoa. Diferente da pontuação, o
 * upsert sobrescreve direto: não é evento imutável (Spec 0005).
 */
export async function lancarPresenca(
  _anterior: EstadoDaPresenca,
  dados: FormData,
): Promise<EstadoDaPresenca> {
  const pessoa = await exigirPessoaLogada();

  const analise = lancamento.safeParse({
    atividade_id: dados.get("atividade_id"),
    data: dados.get("data"),
    crianca_id: dados.get("crianca_id") || undefined,
    usuario_id: dados.get("usuario_id") || undefined,
    status: dados.get("status"),
  });

  if (!analise.success) return { erro: "Confira os campos." };
  if (!analise.data.crianca_id && !analise.data.usuario_id) {
    return { erro: "Presença precisa de uma pessoa." };
  }

  const supabase = await criarClienteDoServidor();

  const chamadaExistente = await supabase
    .from("chamadas")
    .select("id")
    .eq("atividade_id", analise.data.atividade_id)
    .eq("data", analise.data.data)
    .maybeSingle();

  let chamadaId = chamadaExistente.data?.id as string | undefined;

  if (!chamadaId) {
    const criada = await supabase
      .from("chamadas")
      .insert({ atividade_id: analise.data.atividade_id, data: analise.data.data, aberta_por: pessoa.id })
      .select("id")
      .single();

    if (criada.error || !criada.data) {
      if (criada.error?.message.includes("row-level security")) {
        return { erro: "Sem vínculo com esta atividade, sem abrir a chamada." };
      }
      return { erro: "Não foi possível abrir a chamada. Tente de novo." };
    }
    chamadaId = criada.data.id;
  }

  const { error } = await supabase.from("presencas").upsert(
    {
      chamada_id: chamadaId,
      crianca_id: analise.data.crianca_id ?? null,
      usuario_id: analise.data.usuario_id ?? null,
      status: analise.data.status,
      registrado_por: pessoa.id,
      atualizado_em: new Date().toISOString(),
    },
    { onConflict: analise.data.crianca_id ? "chamada_id,crianca_id" : "chamada_id,usuario_id" },
  );

  if (error) return { erro: "Não foi possível lançar a presença. Tente de novo." };

  revalidatePath(`/calendario/${analise.data.atividade_id}/${analise.data.data}`);
  revalidatePath(`/criancas/${analise.data.crianca_id ?? ""}`);
  return {};
}
