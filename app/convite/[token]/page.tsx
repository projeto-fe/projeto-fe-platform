import { createHash } from "node:crypto";

import type { Metadata } from "next";
import Link from "next/link";

import { CabecalhoDeEntrada, MolduraDeEntrada } from "@/components/shell/moldura-de-entrada";
import { Button } from "@/components/ui/button";
import { criarClienteAdministrativo } from "@/lib/supabase/server";

import { FormularioDeAceite } from "./formulario";

export const metadata: Metadata = {
  title: "Aceitar convite",
  description: "Crie sua senha e entre no portal do Instituto Projeto Fé.",
  robots: { index: false },
};

type Situacao = "valido" | "inexistente" | "expirado" | "usado" | "falha";

export default async function AceitarConvite({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  // O banco guarda apenas o hash. O token em claro só existe no e-mail e
  // nesta URL, então nem quem lê a tabela consegue usar convite alheio.
  const tokenHash = createHash("sha256").update(token).digest("hex");

  // Consulta com o papel de serviço porque quem abre este link ainda não tem
  // conta, e portanto nenhuma permissão no banco.
  const supabase = criarClienteAdministrativo();
  const { data: convite, error } = await supabase
    .from("convites")
    .select("id, email, papel, area_id, expira_em, aceito_em")
    .eq("token_hash", tokenHash)
    .maybeSingle();

  // Falha de consulta não é convite inexistente. Tratar as duas como a mesma
  // coisa manda a pessoa conferir um link que está correto, e esconde o
  // defeito de quem deveria corrigi-lo.
  if (error) console.error("[convite] consulta falhou:", error.message);

  let situacao: Situacao = "valido";
  if (error) situacao = "falha";
  else if (!convite) situacao = "inexistente";
  else if (convite.aceito_em) situacao = "usado";
  else if (new Date(convite.expira_em) < new Date()) situacao = "expirado";

  const recados: Record<Exclude<Situacao, "valido">, { titulo: string; texto: string }> = {
    inexistente: {
      titulo: "Convite não encontrado",
      texto: "Confira se o link veio completo no e-mail. Se continuar assim, peça um novo à coordenação.",
    },
    expirado: {
      titulo: "Este convite venceu",
      texto: "Convites valem 7 dias. Peça um novo à coordenação para criar seu acesso.",
    },
    usado: {
      titulo: "Convite já usado",
      texto: "Este link já criou uma conta. Se a conta é sua, entre normalmente.",
    },
    falha: {
      titulo: "Não deu para abrir seu convite",
      texto:
        "O problema é do nosso lado, não do seu link. Avise a coordenação e tente de novo em alguns minutos.",
    },
  };

  return (
    <MolduraDeEntrada
      titulo={
        <>
          Bem-vindo ao <span className="text-brand">Projeto Fé</span>.
        </>
      }
      frase="Falta só escolher sua senha para começar."
    >
      {situacao === "valido" && convite ? (
        <>
          <CabecalhoDeEntrada
            titulo="Criar sua senha"
            descricao={
              <>
                Convite para <span className="font-semibold text-ink">{convite.email}</span>.
              </>
            }
          />
          <FormularioDeAceite token={token} email={convite.email} />
        </>
      ) : (
        <>
          <CabecalhoDeEntrada
            titulo={recados[situacao as Exclude<Situacao, "valido">].titulo}
            descricao={recados[situacao as Exclude<Situacao, "valido">].texto}
          />
          <Button asChild variant="outline" size="lg">
            <Link href="/login">Ir para a tela de entrada</Link>
          </Button>
        </>
      )}
    </MolduraDeEntrada>
  );
}
