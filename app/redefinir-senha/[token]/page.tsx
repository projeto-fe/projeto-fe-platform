import { createHash } from "node:crypto";

import type { Metadata } from "next";
import Link from "next/link";

import { CabecalhoDeEntrada, MolduraDeEntrada } from "@/components/shell/moldura-de-entrada";
import { Button } from "@/components/ui/button";
import { criarClienteAdministrativo } from "@/lib/supabase/server";

import { FormularioDeRedefinicao } from "./formulario";

export const metadata: Metadata = {
  title: "Trocar senha",
  description: "Escolha uma nova senha para o seu acesso ao Portal Projeto Fé.",
  robots: { index: false },
};

type Situacao = "valido" | "inexistente" | "expirado" | "usado" | "falha";

export default async function RedefinirSenha({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  // O banco guarda apenas o hash. O token em claro só existe no e-mail e
  // nesta URL.
  const tokenHash = createHash("sha256").update(token).digest("hex");

  // Consulta com o papel de serviço porque quem abre este link ainda não tem
  // sessão.
  const admin = criarClienteAdministrativo();
  const { data: pedido, error } = await admin
    .from("redefinicoes_senha")
    .select("id, usuario_id, expira_em, usado_em")
    .eq("token_hash", tokenHash)
    .maybeSingle();

  let email: string | undefined;
  let situacao: Situacao = "valido";

  if (error) situacao = "falha";
  else if (!pedido) situacao = "inexistente";
  else if (pedido.usado_em) situacao = "usado";
  else if (new Date(pedido.expira_em) < new Date()) situacao = "expirado";
  else {
    const { data: perfil } = await admin.from("perfis").select("email").eq("id", pedido.usuario_id).maybeSingle();
    if (!perfil) situacao = "inexistente";
    else email = perfil.email;
  }

  if (error) console.error("[redefinir-senha] consulta falhou:", error.message);

  const recados: Record<Exclude<Situacao, "valido">, { titulo: string; texto: string }> = {
    inexistente: {
      titulo: "Link não encontrado",
      texto: "Confira se o link veio completo no e-mail. Se continuar assim, peça um novo.",
    },
    expirado: {
      titulo: "Este link venceu",
      texto: "Links de troca de senha valem 1 hora. Peça um novo para continuar.",
    },
    usado: {
      titulo: "Link já usado",
      texto: "Este link já trocou a senha uma vez. Se ainda não conseguiu entrar, peça um novo.",
    },
    falha: {
      titulo: "Não deu para abrir seu link",
      texto: "O problema é do nosso lado, não do seu link. Tente de novo em alguns minutos.",
    },
  };

  return (
    <MolduraDeEntrada
      titulo={
        <>
          Escolha uma <span className="text-brand">nova senha</span>.
        </>
      }
      frase="Depois de trocar, você já entra direto no portal."
    >
      {situacao === "valido" && email ? (
        <>
          <CabecalhoDeEntrada
            titulo="Trocar senha"
            descricao={
              <>
                Conta <span className="font-semibold text-ink">{email}</span>.
              </>
            }
          />
          <FormularioDeRedefinicao token={token} email={email} />
        </>
      ) : (
        <>
          <CabecalhoDeEntrada
            titulo={recados[situacao as Exclude<Situacao, "valido">].titulo}
            descricao={recados[situacao as Exclude<Situacao, "valido">].texto}
          />
          <Button asChild variant="outline" size="lg">
            <Link href="/esqueci-senha">Pedir um novo link</Link>
          </Button>
        </>
      )}
    </MolduraDeEntrada>
  );
}
