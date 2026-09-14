"use server";

import { createHash, randomBytes } from "node:crypto";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { enderecoDoPortal } from "@/lib/ambiente";
import { registrarAuditoria } from "@/lib/auditoria";
import { enviarConviteNoEmail } from "@/lib/email";
import { exigirPessoaLogada } from "@/lib/sessao";
import { criarClienteDoServidor } from "@/lib/supabase/server";

export type EstadoDoConvite = { erro?: string; sucesso?: string };

const DIAS_DE_VALIDADE = 7;

const convite = z.object({
  email: z.email("Informe um e-mail válido."),
  papel: z.enum(["coordenador", "voluntario"]),
  area_id: z.string().uuid("Escolha a área.").nullable(),
});

export async function convidarPessoa(
  _anterior: EstadoDoConvite,
  dados: FormData,
): Promise<EstadoDoConvite> {
  const pessoa = await exigirPessoaLogada();
  if (!pessoa.isAdmin) return { erro: "Apenas administradores convidam." };

  const area = dados.get("area_id");
  const analise = convite.safeParse({
    email: dados.get("email"),
    papel: dados.get("papel"),
    area_id: area && area !== "" ? area : null,
  });

  if (!analise.success) {
    return { erro: analise.error.issues[0]?.message ?? "Confira os campos." };
  }

  // O token em claro só existe no e-mail. No banco fica o hash, para que
  // nem quem lê a tabela consiga usar um convite alheio.
  const token = randomBytes(32).toString("base64url");
  const tokenHash = createHash("sha256").update(token).digest("hex");

  const expiraEm = new Date();
  expiraEm.setDate(expiraEm.getDate() + DIAS_DE_VALIDADE);

  const supabase = await criarClienteDoServidor();
  const { data, error } = await supabase
    .from("convites")
    .insert({
      email: analise.data.email.toLowerCase(),
      papel: analise.data.papel,
      area_id: analise.data.area_id,
      token_hash: tokenHash,
      expira_em: expiraEm.toISOString(),
      convidado_por: pessoa.id,
    })
    .select("id")
    .single();

  if (error || !data) return { erro: "Não foi possível criar o convite." };

  await registrarAuditoria({
    atorId: pessoa.id,
    acao: "convidou pessoa",
    entidade: "convites",
    entidadeId: data.id,
    detalhe: { email: analise.data.email, papel: analise.data.papel },
    sensivel: true,
  });

  let nomeDaArea: string | undefined;
  if (analise.data.area_id) {
    const { data: area } = await supabase
      .from("areas")
      .select("nome")
      .eq("id", analise.data.area_id)
      .maybeSingle();
    nomeDaArea = area?.nome;
  }

  const envio = await enviarConviteNoEmail({
    para: analise.data.email,
    link: `${enderecoDoPortal()}/convite/${token}`,
    quemConvidou: pessoa.nome,
    papel: analise.data.papel,
    area: nomeDaArea,
    expiraEm,
  });

  revalidatePath("/pessoas");

  // Quando o e-mail não sai, dizer isso é melhor que deixar a pessoa
  // esperando por uma mensagem que nunca chega. O convite continua válido e
  // o link pode ser passado à mão.
  if (!envio.enviado) {
    return {
      sucesso: `Convite criado para ${analise.data.email}, mas o e-mail não saiu (${envio.motivo}). O convite aparece como pendente abaixo.`,
    };
  }

  return { sucesso: `Convite enviado para ${analise.data.email}.` };
}

export async function cancelarConvite(dados: FormData) {
  const pessoa = await exigirPessoaLogada();
  if (!pessoa.isAdmin) return;

  const id = String(dados.get("convite_id"));
  const supabase = await criarClienteDoServidor();
  await supabase.from("convites").delete().eq("id", id);

  await registrarAuditoria({
    atorId: pessoa.id,
    acao: "cancelou convite",
    entidade: "convites",
    entidadeId: id,
    sensivel: true,
  });

  revalidatePath("/pessoas");
}

export async function alternarAcesso(dados: FormData) {
  const pessoa = await exigirPessoaLogada();
  if (!pessoa.isAdmin) return;

  const alvo = String(dados.get("usuario_id"));
  const ativar = dados.get("ativar") === "sim";

  // Um administrador não se desativa sozinho: o sistema ficaria sem ninguém
  // capaz de reativar contas.
  if (alvo === pessoa.id) return;

  const supabase = await criarClienteDoServidor();
  await supabase.from("perfis").update({ ativo: ativar }).eq("id", alvo);

  await registrarAuditoria({
    atorId: pessoa.id,
    acao: ativar ? "reativou acesso" : "desativou acesso",
    entidade: "perfis",
    entidadeId: alvo,
    sensivel: true,
  });

  revalidatePath("/pessoas");
}
