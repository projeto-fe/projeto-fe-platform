import type { Metadata } from "next";

import { CabecalhoDaPagina, CorpoDaPagina } from "@/components/shell/cabecalho-da-pagina";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { exigirPessoaLogada } from "@/lib/sessao";

import { FormularioDeNome } from "./formulario";

export const metadata: Metadata = { title: "Minha conta" };

export default async function Conta() {
  const pessoa = await exigirPessoaLogada();

  return (
    <>
      <CabecalhoDaPagina titulo="Minha conta" />

      <CorpoDaPagina>
        <Card className="max-w-xl">
          <CardHeader>
            <CardTitle>Seus dados</CardTitle>
            <span className="flex-1" />
            <Badge variant={pessoa.isAdmin ? "brand" : "neutral"}>{pessoa.papel}</Badge>
          </CardHeader>
          <CardBody className="flex flex-col gap-4">
            <FormularioDeNome nome={pessoa.nome} />

            <div className="flex flex-col gap-1 border-t border-line pt-4">
              <span className="font-display text-[0.6875rem] font-semibold tracking-wider text-ink-muted uppercase">
                E-mail
              </span>
              <span className="text-sm">{pessoa.email}</span>
              <span className="text-xs text-ink-muted">
                Para trocar o e-mail, fale com um administrador.
              </span>
            </div>
          </CardBody>
        </Card>
      </CorpoDaPagina>
    </>
  );
}
