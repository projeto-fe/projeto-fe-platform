import type { Metadata } from "next";

import { CabecalhoDaPagina, CorpoDaPagina } from "@/components/shell/cabecalho-da-pagina";
import { Badge } from "@/components/ui/badge";
import { Ajuda, Rotulo } from "@/components/ui/campo";
import {
  Card,
  CardBody,
  CardDescription,
  CardHeader,
  CardHeading,
  CardTitle,
} from "@/components/ui/card";
import { exigirPessoaLogada } from "@/lib/sessao";

import { FormularioDeNome } from "./formulario";

export const metadata: Metadata = { title: "Minha conta" };

export default async function Conta() {
  const pessoa = await exigirPessoaLogada();

  return (
    <>
      <CabecalhoDaPagina titulo="Minha conta" descricao="Como você aparece para a equipe." />

      <CorpoDaPagina>
        <Card className="max-w-xl">
          <CardHeader>
            <CardHeading>
              <CardTitle>Seus dados</CardTitle>
              <CardDescription>Nome e e-mail de acesso.</CardDescription>
            </CardHeading>
            <Badge variant={pessoa.isAdmin ? "brand" : "neutral"}>{pessoa.papel}</Badge>
          </CardHeader>
          <CardBody className="flex flex-col gap-5">
            <FormularioDeNome nome={pessoa.nome} />

            <div className="flex flex-col gap-1.5 border-t border-line pt-5">
              <Rotulo>E-mail</Rotulo>
              <span className="text-base">{pessoa.email}</span>
              <Ajuda>Para trocar o e-mail, fale com um administrador.</Ajuda>
            </div>
          </CardBody>
        </Card>
      </CorpoDaPagina>
    </>
  );
}
