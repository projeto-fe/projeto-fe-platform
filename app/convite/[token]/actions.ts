"use server";

import { createHash } from "node:crypto";

import { redirect } from "next/navigation";
import { z } from "zod";

import { registrarAuditoria } from "@/lib/auditoria";
import { criarClienteAdministrativo, criarClienteDoServidor } from "@/lib/supabase/server";

export type EstadoDoAceite = { erro?: string };

const aceite = z
  .object({
    token: z.string().min(10),
    senha: z.string().min(10, "A senha precisa de pelo menos 10 caracteres."),
    confirmacao: z.string(),
    nome: z.string().trim().min(2, "Informe seu nome."),
  })
  .refine((v) => v.senha === v.confirmacao, {
    message: "As duas senhas precisam ser iguais.",
    path: ["confirmacao"],
  });

export async function aceitarConvite(
  _anterior: EstadoDoAceite,
  dados: FormData,
): Promise<EstadoDoAceite> {
  const analise = aceite.safeParse({
    token: dados.get("token"),
    senha: dados.get("senha"),
    confirmacao: dados.get("confirmacao"),
    nome: dados.get("nome"),
  });

  if (!analise.success) {
    return { erro: analise.error.issues[0]?.message ?? "Confira os campos." };
  }

  const tokenHash = createHash("sha256").update(analise.data.token).digest("hex");
  const admin = criarClienteAdministrativo();

  const { data: convite } = await admin
    .from("convites")
    .select("id, email, papel, area_id, expira_em, aceito_em")
    .eq("token_hash", tokenHash)
    .maybeSingle();

  if (!convite) return { erro: "Convite inválido." };
  if (convite.aceito_em) return { erro: "Este convite já foi usado." };
  if (new Date(convite.expira_em) < new Date()) return { erro: "Este convite venceu." };

  // O cadastro aberto está desligado, então a conta nasce pelo papel de
  // serviço, e só a partir de um convite válido.
  const { data: criado, error: erroDeCriacao } = await admin.auth.admin.createUser({
    email: convite.email,
    password: analise.data.senha,
    email_confirm: true,
    user_metadata: { nome: analise.data.nome },
  });

  if (erroDeCriacao || !criado.user) {
    if (erroDeCriacao?.message.toLowerCase().includes("already")) {
      return { erro: "Já existe conta com este e-mail. Entre pela tela de acesso." };
    }
    return { erro: "Não foi possível criar a conta. Tente de novo." };
  }

  // O perfil nasce por gatilho. Aqui entra só o vínculo com a área.
  if (convite.area_id && convite.papel) {
    await admin.from("area_membros").insert({
      usuario_id: criado.user.id,
      area_id: convite.area_id,
      papel: convite.papel,
    });
  }

  await admin.from("convites").update({ aceito_em: new Date().toISOString() }).eq("id", convite.id);

  await registrarAuditoria({
    atorId: criado.user.id,
    acao: "aceitou convite e criou conta",
    entidade: "perfis",
    entidadeId: criado.user.id,
    detalhe: { email: convite.email, papel: convite.papel },
    sensivel: true,
  });

  // Já entra com a sessão criada, sem obrigar a digitar a senha de novo.
  const supabase = await criarClienteDoServidor();
  await supabase.auth.signInWithPassword({
    email: convite.email,
    password: analise.data.senha,
  });

  redirect("/");
}
