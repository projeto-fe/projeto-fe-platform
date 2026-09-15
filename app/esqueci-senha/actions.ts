"use server";

import { createHash, randomBytes } from "node:crypto";

import { z } from "zod";

import { enderecoDoPortal } from "@/lib/ambiente";
import { enviarRedefinicaoDeSenhaNoEmail } from "@/lib/email";
import { criarClienteAdministrativo } from "@/lib/supabase/server";

export type EstadoDoPedido = { erro?: string; sucesso?: string };

const HORAS_DE_VALIDADE = 1;

const pedido = z.object({
  email: z.email("Informe um e-mail válido."),
});

// Mesma frase sempre, exista ou não conta com este e-mail: dizer que a conta
// não existe entregaria quem tem acesso ao portal para quem só está tentando
// descobrir (mesmo raciocínio do erro único de login).
const MENSAGEM_UNICA =
  "Se este e-mail tiver uma conta, o link para trocar a senha chega em instantes.";

export async function pedirRedefinicaoDeSenha(
  _anterior: EstadoDoPedido,
  dados: FormData,
): Promise<EstadoDoPedido> {
  const analise = pedido.safeParse({ email: dados.get("email") });

  if (!analise.success) {
    return { erro: analise.error.issues[0]?.message ?? "Confira o e-mail." };
  }

  const admin = criarClienteAdministrativo();
  const { data: perfil } = await admin
    .from("perfis")
    .select("id, email, ativo")
    .ilike("email", analise.data.email)
    .maybeSingle();

  if (!perfil || !perfil.ativo) {
    return { sucesso: MENSAGEM_UNICA };
  }

  const token = randomBytes(32).toString("base64url");
  const tokenHash = createHash("sha256").update(token).digest("hex");

  const expiraEm = new Date();
  expiraEm.setHours(expiraEm.getHours() + HORAS_DE_VALIDADE);

  const { error } = await admin.from("redefinicoes_senha").insert({
    usuario_id: perfil.id,
    token_hash: tokenHash,
    expira_em: expiraEm.toISOString(),
  });

  // Falha ao gravar o pedido não pode virar uma pista de que a conta existe:
  // a mensagem continua a mesma, o e-mail é que não sai.
  if (!error) {
    await enviarRedefinicaoDeSenhaNoEmail({
      para: perfil.email,
      link: `${enderecoDoPortal()}/redefinir-senha/${token}`,
    });
  }

  return { sucesso: MENSAGEM_UNICA };
}
