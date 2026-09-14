import { createHash } from "node:crypto";

import type { Metadata } from "next";

import { Logo } from "@/components/marca/logo";
import { criarClienteAdministrativo } from "@/lib/supabase/server";

import { FormularioDeAceite } from "./formulario";

export const metadata: Metadata = { title: "Aceitar convite", robots: { index: false } };

type Situacao = "valido" | "inexistente" | "expirado" | "usado";

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
  const { data: convite } = await supabase
    .from("convites")
    .select("id, email, papel, area_id, expira_em, aceito_em")
    .eq("token_hash", tokenHash)
    .maybeSingle();

  let situacao: Situacao = "valido";
  if (!convite) situacao = "inexistente";
  else if (convite.aceito_em) situacao = "usado";
  else if (new Date(convite.expira_em) < new Date()) situacao = "expirado";

  const recados: Record<Exclude<Situacao, "valido">, string> = {
    inexistente: "Este convite não existe. Confira se o link veio completo.",
    expirado: "Este convite venceu. Peça um novo à coordenação.",
    usado: "Este convite já foi usado. Se a conta é sua, entre normalmente.",
  };

  return (
    <main className="grid min-h-dvh md:grid-cols-2">
      <section className="flex flex-col justify-between gap-7 bg-brand-canvas px-6 py-8 md:px-9 md:py-10">
        <Logo claro />
        <div className="flex flex-col gap-3">
          <h1 className="font-display text-3xl leading-[1.12] font-semibold text-brand-canvas-ink md:text-4xl">
            Bem-vindo ao <span className="text-brand">Projeto Fé</span>.
          </h1>
          <p className="max-w-[34ch] text-sm text-brand-canvas-ink/70">
            Falta só escolher sua senha para começar.
          </p>
        </div>
        <p className="text-xs text-brand-canvas-ink/50">Instituto Projeto Fé · Marília, SP</p>
      </section>

      <section className="flex flex-col justify-center gap-5 bg-surface-raised px-6 py-10 md:px-9">
        {situacao === "valido" && convite ? (
          <>
            <div className="flex flex-col gap-1">
              <h2 className="font-display text-2xl font-semibold">Criar sua senha</h2>
              <p className="text-sm text-ink-muted">
                Convite para <span className="font-semibold text-ink">{convite.email}</span>.
              </p>
            </div>
            <FormularioDeAceite token={token} email={convite.email} />
          </>
        ) : (
          <div className="flex flex-col gap-3">
            <h2 className="font-display text-2xl font-semibold">Convite indisponível</h2>
            <p className="text-sm text-ink-muted">{recados[situacao as Exclude<Situacao, "valido">]}</p>
            <a
              href="/login"
              className="text-sm font-semibold text-brand-ink underline underline-offset-2"
            >
              Ir para a tela de entrada
            </a>
          </div>
        )}
      </section>
    </main>
  );
}
