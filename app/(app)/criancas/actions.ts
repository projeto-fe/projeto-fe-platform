"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { exigirPessoaLogada } from "@/lib/sessao";
import { criarClienteDoServidor } from "@/lib/supabase/server";

export type EstadoDaCrianca = { erro?: string };

const opcional = (esquema: z.ZodString) =>
  z.preprocess((v) => (typeof v === "string" && v.trim() === "" ? undefined : v), esquema.optional());

const numeroOpcional = (min: number, max: number) =>
  z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? undefined : Number(v)),
    z.number().min(min).max(max).optional(),
  );

const cadastro = z.object({
  nome_completo: z.string().trim().min(3, "Informe o nome completo."),
  nome_jogador: z
    .string()
    .trim()
    .min(2, "Informe o nome de jogador.")
    .max(30, "Use no máximo 30 caracteres."),
  data_nascimento: z.string().min(1, "Informe a data de nascimento."),
  tem_problema_saude: z.coerce.boolean(),
  observacao_saude: opcional(z.string().max(300)),
  peso_kg: numeroOpcional(5, 200),
  altura_m: numeroOpcional(0.5, 2.5),
  numero_calcado: numeroOpcional(10, 50),
  uniforme: z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
    z.enum(["PP", "P", "M", "G", "GG"]).optional(),
  ),
  observacoes_gerais: opcional(z.string().max(1000)),
  atividades: z.array(z.string().uuid()).default([]),

  // sensíveis
  cep: opcional(z.string().max(9)),
  logradouro: opcional(z.string().max(160)),
  numero: opcional(z.string().max(12)),
  complemento: opcional(z.string().max(80)),
  bairro: opcional(z.string().max(80)),
  cidade: opcional(z.string().max(80)),
  uf: opcional(z.string().length(2)),
  telefone_principal: opcional(z.string().max(20)),
  telefone_secundario: opcional(z.string().max(20)),
  nome_mae: opcional(z.string().max(120)),
  nome_pai: opcional(z.string().max(120)),
  autorizacao_responsavel_nome: opcional(z.string().max(120)),
  autorizacao_data: opcional(z.string()),
});

function lerFormulario(dados: FormData) {
  const bruto = Object.fromEntries(dados.entries());
  return cadastro.safeParse({
    ...bruto,
    tem_problema_saude: dados.get("tem_problema_saude") === "sim",
    atividades: dados.getAll("atividades").map(String),
  });
}

export async function salvarCrianca(
  _anterior: EstadoDaCrianca,
  dados: FormData,
): Promise<EstadoDaCrianca> {
  const pessoa = await exigirPessoaLogada();
  const analise = lerFormulario(dados);

  if (!analise.success) {
    return { erro: analise.error.issues[0]?.message ?? "Confira os campos." };
  }

  const v = analise.data;
  const id = dados.get("id") ? String(dados.get("id")) : null;
  const supabase = await criarClienteDoServidor();

  const basico = {
    nome_completo: v.nome_completo,
    nome_jogador: v.nome_jogador,
    data_nascimento: v.data_nascimento,
    tem_problema_saude: v.tem_problema_saude,
    observacao_saude: v.observacao_saude ?? null,
    // inteiros: gramas e centímetros, nunca ponto flutuante
    peso_g: v.peso_kg ? Math.round(v.peso_kg * 1000) : null,
    altura_cm: v.altura_m ? Math.round(v.altura_m * 100) : null,
    numero_calcado: v.numero_calcado ?? null,
    uniforme: v.uniforme ?? null,
    observacoes_gerais: v.observacoes_gerais ?? null,
  };

  let criancaId = id;

  if (id) {
    const { error } = await supabase.from("criancas").update(basico).eq("id", id);
    if (error) return { erro: mensagemDeErro(error.message) };
  } else {
    const { data, error } = await supabase
      .from("criancas")
      .insert({ ...basico, criado_por: pessoa.id })
      .select("id")
      .single();
    if (error || !data) return { erro: mensagemDeErro(error?.message ?? "") };
    criancaId = data.id;
  }

  // Dado sensível vive em tabela própria, e só coordenação e administração
  // conseguem escrever. Voluntário salva o cadastro básico e esta parte é
  // simplesmente ignorada pela política do banco.
  if (pessoa.isAdmin || pessoa.coordenaAlgumaArea) {
    await supabase.from("criancas_dados_sensiveis").upsert(
      {
        crianca_id: criancaId!,
        cep: v.cep ?? null,
        logradouro: v.logradouro ?? null,
        numero: v.numero ?? null,
        complemento: v.complemento ?? null,
        bairro: v.bairro ?? null,
        cidade: v.cidade ?? null,
        uf: v.uf ?? null,
        telefone_principal: v.telefone_principal ?? null,
        telefone_secundario: v.telefone_secundario ?? null,
        nome_mae: v.nome_mae ?? null,
        nome_pai: v.nome_pai ?? null,
        autorizacao_responsavel_nome: v.autorizacao_responsavel_nome ?? null,
        autorizacao_data: v.autorizacao_data ?? null,
        autorizacao_colhida_por: v.autorizacao_responsavel_nome ? pessoa.id : null,
        atualizado_em: new Date().toISOString(),
      },
      { onConflict: "crianca_id" },
    );
  }

  // Inscrições: troca o conjunto inteiro pelo que veio do formulário.
  await supabase.from("crianca_atividades").delete().eq("crianca_id", criancaId!);
  if (v.atividades.length > 0) {
    await supabase
      .from("crianca_atividades")
      .insert(v.atividades.map((atividade_id) => ({ crianca_id: criancaId!, atividade_id })));
  }

  revalidatePath("/criancas");
  redirect(`/criancas?salvo=${criancaId}`);
}

function mensagemDeErro(mensagem: string) {
  if (mensagem.includes("criancas_nome_jogador_key")) {
    return "Esse nome de jogador já está em uso. Escolha outro.";
  }
  return "Não foi possível salvar. Confira os campos e tente de novo.";
}
