"use server";

import { createHash, randomBytes } from "node:crypto";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { registrarAuditoria } from "@/lib/auditoria";
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

  revalidatePath("/pessoas");

  // O envio do e-mail entra quando o domínio estiver verificado no Resend.
  // Até lá o convite existe e aparece como pendente na tela.
  return {
    sucesso: `Convite criado para ${analise.data.email}. O envio por e-mail ainda não está ligado.`,
  };
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
