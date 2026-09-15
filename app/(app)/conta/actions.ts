"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { criarClienteDoServidor } from "@/lib/supabase/server";

const nomeValido = z
  .string()
  .trim()
  .min(2, "Informe pelo menos duas letras.")
  .max(80, "Use no máximo 80 caracteres.");

export type EstadoDaConta = { erro?: string; sucesso?: boolean };

export async function salvarNome(
  _anterior: EstadoDaConta,
  dados: FormData,
): Promise<EstadoDaConta> {
  const analise = nomeValido.safeParse(dados.get("nome"));

  if (!analise.success) {
    return { erro: analise.error.issues[0]?.message };
  }

  const supabase = await criarClienteDoServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // A política permite atualizar apenas o próprio perfil, e um gatilho impede
  // que privilégio ou situação da conta mudem por este caminho.
  const { error } = await supabase
    .from("perfis")
    .update({ nome: analise.data })
    .eq("id", user.id);

  if (error) {
    return { erro: "Não foi possível salvar. Tente de novo." };
  }

  revalidatePath("/", "layout");
  return { sucesso: true };
}

export async function sair() {
  const supabase = await criarClienteDoServidor();

  // Escopo local: encerra só esta sessão. O padrão é global, que revoga a
  // sessão em todos os aparelhos e cobra uma ida a mais ao servidor de
  // autenticação. Sair do portal no computador não deveria derrubar a
  // pessoa no celular.
  await supabase.auth.signOut({ scope: "local" });

  redirect("/login");
}
