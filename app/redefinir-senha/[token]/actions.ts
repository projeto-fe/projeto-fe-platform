"use server";

import { createHash } from "node:crypto";

import { redirect } from "next/navigation";
import { z } from "zod";

import { registrarAuditoria } from "@/lib/auditoria";
import { criarClienteAdministrativo, criarClienteDoServidor } from "@/lib/supabase/server";

export type EstadoDaRedefinicao = { erro?: string };

const redefinicao = z
  .object({
    token: z.string().min(10),
    senha: z.string().min(10, "A senha precisa de pelo menos 10 caracteres."),
    confirmacao: z.string(),
  })
  .refine((v) => v.senha === v.confirmacao, {
    message: "As duas senhas precisam ser iguais.",
    path: ["confirmacao"],
  });

export async function redefinirSenha(
  _anterior: EstadoDaRedefinicao,
  dados: FormData,
): Promise<EstadoDaRedefinicao> {
  const analise = redefinicao.safeParse({
    token: dados.get("token"),
    senha: dados.get("senha"),
    confirmacao: dados.get("confirmacao"),
  });

  if (!analise.success) {
    return { erro: analise.error.issues[0]?.message ?? "Confira os campos." };
  }

  const tokenHash = createHash("sha256").update(analise.data.token).digest("hex");
  const admin = criarClienteAdministrativo();

  const { data: pedido } = await admin
    .from("redefinicoes_senha")
    .select("id, usuario_id, expira_em, usado_em")
    .eq("token_hash", tokenHash)
    .maybeSingle();

  if (!pedido) return { erro: "Link inválido." };
  if (pedido.usado_em) return { erro: "Este link já foi usado." };
  if (new Date(pedido.expira_em) < new Date()) return { erro: "Este link venceu." };

  const { data: perfil } = await admin
    .from("perfis")
    .select("email, ativo")
    .eq("id", pedido.usuario_id)
    .maybeSingle();

  if (!perfil || !perfil.ativo) return { erro: "Esta conta não tem mais acesso ao portal." };

  const { error: erroDeSenha } = await admin.auth.admin.updateUserById(pedido.usuario_id, {
    password: analise.data.senha,
  });

  if (erroDeSenha) return { erro: "Não foi possível trocar a senha. Tente de novo." };

  await admin.from("redefinicoes_senha").update({ usado_em: new Date().toISOString() }).eq("id", pedido.id);

  await registrarAuditoria({
    atorId: pedido.usuario_id,
    acao: "redefiniu a própria senha",
    entidade: "perfis",
    entidadeId: pedido.usuario_id,
    sensivel: true,
  });

  // Já entra com a sessão criada, sem obrigar a digitar a senha de novo.
  const supabase = await criarClienteDoServidor();
  await supabase.auth.signInWithPassword({ email: perfil.email, password: analise.data.senha });

  redirect("/");
}
