"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { caminhoDoGuiaCultural } from "@/lib/arquivos";
import { enviarArquivo } from "@/lib/arquivos-dados";
import { caminhoFotoDoUsuario } from "@/lib/fotos";
import { enviarFoto, removerFoto } from "@/lib/fotos-dados";
import { exigirPessoaLogada } from "@/lib/sessao";
import { criarClienteDoServidor } from "@/lib/supabase/server";

const nomeValido = z
  .string()
  .trim()
  .min(2, "Informe pelo menos duas letras.")
  .max(80, "Use no máximo 80 caracteres.");

export type EstadoDaConta = { erro?: string; sucesso?: string };

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
  return { sucesso: "Nome atualizado." };
}

export type EstadoDaFoto = { erro?: string };

/** Foto do próprio usuário. Só quem está logado mexe na própria, nunca na de outra pessoa. */
export async function enviarFotoDoUsuario(
  _anterior: EstadoDaFoto,
  dados: FormData,
): Promise<EstadoDaFoto> {
  const supabase = await criarClienteDoServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const arquivo = dados.get("foto");
  if (!(arquivo instanceof File)) return { erro: "Escolha um arquivo de imagem." };

  const resultado = await enviarFoto(caminhoFotoDoUsuario(user.id), arquivo);
  if (resultado.erro) return resultado;

  revalidatePath("/", "layout");
  return {};
}

// O parâmetro não é usado: quem apaga é sempre a própria sessão. Existe só
// para bater com a assinatura que `UploadDeFoto` espera de `acaoDeRemover`.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function removerFotoDoUsuario(_dados: FormData) {
  const supabase = await criarClienteDoServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await removerFoto(caminhoFotoDoUsuario(user.id));
  revalidatePath("/", "layout");
}

export type EstadoDoArquivo = { erro?: string };

/** Guia cultural do Instituto: qualquer um vê e baixa, só administrador troca. */
export async function enviarGuiaCultural(
  _anterior: EstadoDoArquivo,
  dados: FormData,
): Promise<EstadoDoArquivo> {
  const pessoa = await exigirPessoaLogada();
  if (!pessoa.isAdmin) return { erro: "Apenas administradores trocam o guia cultural." };

  const arquivo = dados.get("arquivo");
  if (!(arquivo instanceof File)) return { erro: "Escolha um arquivo." };

  const resultado = await enviarArquivo(caminhoDoGuiaCultural(), arquivo);
  if (resultado.erro) return resultado;

  revalidatePath("/conta");
  return {};
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
