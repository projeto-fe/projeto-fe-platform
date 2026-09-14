"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

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
