import { redirect } from "next/navigation";

import { criarClienteDoServidor } from "@/lib/supabase/server";

export type PessoaLogada = {
  id: string;
  nome: string;
  email: string;
  isAdmin: boolean;
  /** Rótulo do papel para exibição, derivado dos vínculos de área. */
  papel: string;
  coordenaAlgumaArea: boolean;
};

/**
 * Carrega a pessoa autenticada com o papel lido do banco.
 *
 * O papel nunca vem do token nem de metadado do usuário, porque esses são
 * editáveis pelo cliente em alguns fluxos. Vem sempre da tabela.
 */
export async function exigirPessoaLogada(): Promise<PessoaLogada> {
  const supabase = await criarClienteDoServidor();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: perfil } = await supabase
    .from("perfis")
    .select("id, nome, email, is_admin, ativo")
    .eq("id", user.id)
    .single();

  // Sem perfil, ou desativado, a conta existe no autenticador mas não tem
  // acesso ao sistema. Encerra a sessão em vez de deixar numa tela vazia.
  if (!perfil || !perfil.ativo) {
    await supabase.auth.signOut();
    redirect("/login?motivo=sem-acesso");
  }

  const { data: vinculos } = await supabase
    .from("area_membros")
    .select("papel")
    .eq("usuario_id", user.id);

  const coordena = (vinculos ?? []).some((v) => v.papel === "coordenador");

  return {
    id: perfil.id,
    nome: perfil.nome,
    email: perfil.email,
    isAdmin: perfil.is_admin,
    coordenaAlgumaArea: coordena,
    papel: perfil.is_admin ? "Administrador" : coordena ? "Coordenador" : "Voluntário",
  };
}
