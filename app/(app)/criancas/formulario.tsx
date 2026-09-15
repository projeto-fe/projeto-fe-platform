"use client";

import { AlertCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { AvisoDoFormulario } from "@/components/ui/campo";
import { Card, CardBody, CardFooter } from "@/components/ui/card";
import {
  DialogoAviso,
  DialogoCabecalho,
  DialogoCorpo,
  DialogoDescricao,
  DialogoFechar,
  DialogoRodape,
  DialogoTitulo,
  useAcaoEmDialogo,
} from "@/components/ui/dialogo";

import { salvarCrianca, type EstadoDaCrianca } from "./actions";
import { CamposDaCrianca } from "./campos";
import type { Atividade, ValoresDaCrianca } from "./valores";

const inicial: EstadoDaCrianca = {};

type Props = {
  valores?: ValoresDaCrianca;
  atividades: Atividade[];
  podeVerSensiveis: boolean;
};

function descricaoDoAcesso(podeVerSensiveis: boolean) {
  return podeVerSensiveis
    ? "Todos os dados ficam restritos à equipe."
    : "Cadastro básico; endereço e contato ficam com a coordenação.";
}

function Obrigatorios() {
  return (
    <span className="w-full text-xs text-ink-muted sm:mr-auto sm:w-auto">
      Campos com <span className="text-brand">*</span> são obrigatórios.
    </span>
  );
}

/**
 * Cadastro no diálogo, que é como a equipe chega nele: pelo botão da lista ou
 * clicando numa criança. Ao salvar, a lista embaixo já vem atualizada.
 */
export function CadastroDaCriancaEmDialogo({
  valores = {},
  atividades,
  podeVerSensiveis,
  aoSalvar,
}: Props & { aoSalvar: () => void }) {
  const { estado, enviar, enviando: salvando } = useAcaoEmDialogo(salvarCrianca, inicial, aoSalvar);
  const editando = Boolean(valores.id);

  return (
    <form onSubmit={enviar} className="flex min-h-0 flex-1 flex-col">
      {valores.id ? <input type="hidden" name="id" value={valores.id} /> : null}

      <DialogoCabecalho>
        <DialogoTitulo>{editando ? valores.nome_completo : "Nova criança"}</DialogoTitulo>
        <DialogoDescricao>{descricaoDoAcesso(podeVerSensiveis)}</DialogoDescricao>
      </DialogoCabecalho>

      <DialogoCorpo className="flex flex-col">
        <CamposDaCrianca
          valores={valores}
          atividades={atividades}
          podeVerSensiveis={podeVerSensiveis}
        />

      </DialogoCorpo>

      {estado.erro ? (
        <DialogoAviso>
          <AvisoDoFormulario tom="erro" icone={<AlertCircle />}>
            {estado.erro}
          </AvisoDoFormulario>
        </DialogoAviso>
      ) : null}

      <DialogoRodape className="flex-wrap sm:justify-start">
        <Obrigatorios />
        <DialogoFechar asChild>
          <Button type="button" variant="outline" className="flex-1 sm:flex-none">
            Cancelar
          </Button>
        </DialogoFechar>
        <Button type="submit" loading={salvando} className="flex-1 sm:flex-none">
          Salvar cadastro
        </Button>
      </DialogoRodape>
    </form>
  );
}

/**
 * O mesmo cadastro como página inteira. É o que aparece quando alguém abre o
 * endereço direto, recarrega a aba ou recebe o link de um colega.
 */
export function FormularioDaCrianca({ valores = {}, atividades, podeVerSensiveis }: Props) {
  const router = useRouter();
  const voltarParaLista = React.useCallback(() => router.push("/criancas"), [router]);
  const { estado, enviar, enviando: salvando } = useAcaoEmDialogo(
    salvarCrianca,
    inicial,
    voltarParaLista,
  );

  return (
    <form onSubmit={enviar}>
      {valores.id ? <input type="hidden" name="id" value={valores.id} /> : null}

      <Card className="overflow-visible">
        <CardBody className="flex flex-col pt-6">
          <CamposDaCrianca
            valores={valores}
            atividades={atividades}
            podeVerSensiveis={podeVerSensiveis}
          />

        </CardBody>

        {estado.erro ? (
          <div className="border-t border-line px-4 pt-4">
            <AvisoDoFormulario tom="erro" icone={<AlertCircle />}>
              {estado.erro}
            </AvisoDoFormulario>
          </div>
        ) : null}

        <CardFooter className="z-10 flex-wrap gap-2 rounded-b-lg md:sticky md:bottom-0">
          <Obrigatorios />
          <Button asChild variant="outline" className="flex-1 sm:flex-none">
            <Link href="/criancas">Cancelar</Link>
          </Button>
          <Button type="submit" loading={salvando} className="flex-1 sm:flex-none">
            Salvar cadastro
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
