"use server";

import { createHash, randomBytes } from "node:crypto";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { enderecoDoPortal } from "@/lib/ambiente";
import { registrarAuditoria } from "@/lib/auditoria";
import { enviarConviteNoEmail } from "@/lib/email";
import { exigirPessoaLogada } from "@/lib/sessao";
import { conferirSenha, criarClienteDoServidor } from "@/lib/supabase/server";

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

export type EstadoDoAcesso = { erro?: string; sucesso?: string };

const vinculoDaPessoa = z.object({
  usuario_id: z.string().uuid(),
  area_id: z.string().uuid("Escolha a área."),
  papel: z.enum(["coordenador", "voluntario"]),
});

/**
 * Define o papel de alguém dentro de uma área.
 *
 * É aqui que "promover" acontece no dia a dia: papel vale por área (ADR 0004),
 * então quem coordena o Educacional pode ser voluntário no Esportivo. O upsert
 * cobre os dois casos, vincular e trocar de papel, porque a chave é o par
 * pessoa+área.
 */
export async function definirPapelNaArea(
  _anterior: EstadoDoAcesso,
  dados: FormData,
): Promise<EstadoDoAcesso> {
  const pessoa = await exigirPessoaLogada();
  if (!pessoa.isAdmin) return { erro: "Apenas administradores mudam o papel de alguém." };

  const analise = vinculoDaPessoa.safeParse({
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

  if (error) return { erro: "Não foi possível salvar o papel. Tente de novo." };

  await registrarAuditoria({
    atorId: pessoa.id,
    acao: "definiu papel em área",
    entidade: "area_membros",
    entidadeId: analise.data.usuario_id,
    detalhe: { area_id: analise.data.area_id, papel: analise.data.papel },
    sensivel: true,
  });

  revalidatePath("/pessoas");
  revalidatePath("/estrutura");
  return { sucesso: "Papel atualizado." };
}

export async function removerDaArea(dados: FormData) {
  const pessoa = await exigirPessoaLogada();
  if (!pessoa.isAdmin) return;

  const usuario_id = String(dados.get("usuario_id"));
  const area_id = String(dados.get("area_id"));

  const supabase = await criarClienteDoServidor();
  await supabase.from("area_membros").delete().eq("usuario_id", usuario_id).eq("area_id", area_id);

  await registrarAuditoria({
    atorId: pessoa.id,
    acao: "removeu pessoa de área",
    entidade: "area_membros",
    entidadeId: usuario_id,
    detalhe: { area_id },
    sensivel: true,
  });

  revalidatePath("/pessoas");
  revalidatePath("/estrutura");
}

const promocao = z.object({
  usuario_id: z.string().uuid(),
  confirmacao: z.string().min(1, "Digite o nome da pessoa para confirmar."),
  senha: z.string().min(1, "Informe sua senha."),
});

/**
 * Concede privilégio de administrador.
 *
 * Diferente de todo o resto do portal, isto não é uma ação com desfazer: um
 * administrador vê endereço e telefone de todas as crianças, convida gente,
 * mexe na estrutura e promove outros administradores. Por isso a confirmação
 * tem duas partes que só quem pretendia fazer isso consegue completar:
 *
 *   1. digitar o nome da pessoa, que impede promover a linha errada da lista;
 *   2. a própria senha, que impede que um computador destravado vire uma
 *      promoção.
 *
 * O trigger `perfis_sem_autopromocao` no banco continua sendo a garantia de
 * verdade; isto aqui é a que a pessoa enxerga.
 */
export async function promoverParaAdmin(
  _anterior: EstadoDoAcesso,
  dados: FormData,
): Promise<EstadoDoAcesso> {
  const pessoa = await exigirPessoaLogada();
  if (!pessoa.isAdmin) return { erro: "Apenas administradores promovem." };

  const analise = promocao.safeParse({
    usuario_id: dados.get("usuario_id"),
    confirmacao: dados.get("confirmacao"),
    senha: dados.get("senha"),
  });

  if (!analise.success) {
    return { erro: analise.error.issues[0]?.message ?? "Confira os campos." };
  }

  const supabase = await criarClienteDoServidor();
  const { data: alvo } = await supabase
    .from("perfis")
    .select("id, nome, email, is_admin, ativo")
    .eq("id", analise.data.usuario_id)
    .maybeSingle();

  if (!alvo) return { erro: "Esta pessoa não existe mais." };
  if (alvo.is_admin) return { erro: `${alvo.nome} já é administrador.` };
  if (!alvo.ativo) {
    return { erro: `${alvo.nome} está sem acesso. Reative a conta antes de promover.` };
  }

  if (normalizar(analise.data.confirmacao) !== normalizar(alvo.nome)) {
    return { erro: `O nome digitado não confere com "${alvo.nome}".` };
  }

  if (!(await conferirSenha(pessoa.email, analise.data.senha))) {
    return { erro: "Senha incorreta." };
  }

  const { error } = await supabase
    .from("perfis")
    .update({ is_admin: true })
    .eq("id", alvo.id);

  if (error) return { erro: "Não foi possível promover. Tente de novo." };

  await registrarAuditoria({
    atorId: pessoa.id,
    acao: "promoveu a administrador",
    entidade: "perfis",
    entidadeId: alvo.id,
    detalhe: { nome: alvo.nome, email: alvo.email },
    sensivel: true,
  });

  revalidatePath("/pessoas");
  return { sucesso: `${alvo.nome} agora é administrador.` };
}

/** Compara nome digitado sem depender de acento, caixa ou espaço sobrando. */
function normalizar(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

export async function revogarAdmin(dados: FormData) {
  const pessoa = await exigirPessoaLogada();
  if (!pessoa.isAdmin) return;

  const alvo = String(dados.get("usuario_id"));

  // Ninguém tira o próprio privilégio: o portal ficaria sem quem promove.
  if (alvo === pessoa.id) return;

  const supabase = await criarClienteDoServidor();
  await supabase.from("perfis").update({ is_admin: false }).eq("id", alvo);

  await registrarAuditoria({
    atorId: pessoa.id,
    acao: "removeu privilégio de administrador",
    entidade: "perfis",
    entidadeId: alvo,
    detalhe: { nome: String(dados.get("nome") ?? "") },
    sensivel: true,
  });

  revalidatePath("/pessoas");
}
