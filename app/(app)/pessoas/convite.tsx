"use client";

import { AlertCircle, Check } from "lucide-react";
import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Campo, CampoSelecao, GradeDeCampos } from "@/components/ui/campo";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";

import { convidarPessoa, type EstadoDoConvite } from "./actions";

const inicial: EstadoDoConvite = {};

export function FormularioDeConvite({ areas }: { areas: { id: string; nome: string }[] }) {
  const [estado, acao, enviando] = useActionState(convidarPessoa, inicial);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Convidar pessoa</CardTitle>
      </CardHeader>
      <CardBody>
        <form action={acao} className="flex flex-col gap-3">
          <GradeDeCampos>
            <Campo
              id="email"
              name="email"
              rotulo="E-mail"
              type="email"
              colunas={12}
              obrigatorio
              placeholder="nome@exemplo.com"
            />
            <CampoSelecao id="papel" name="papel" rotulo="Papel" colunas={6}>
              <option value="voluntario">Voluntário</option>
              <option value="coordenador">Coordenação</option>
            </CampoSelecao>
            <CampoSelecao
              id="area_id"
              name="area_id"
              rotulo="Área"
              colunas={6}
              ajuda={areas.length === 0 ? "Crie uma área antes." : undefined}
            >
              <option value="">Definir depois</option>
              {areas.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.nome}
                </option>
              ))}
            </CampoSelecao>
          </GradeDeCampos>

          {estado.erro ? (
            <p
              role="alert"
              className="flex items-start gap-2 rounded-sm bg-negative-soft px-3 py-2 text-sm text-negative-strong"
            >
              <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
              {estado.erro}
            </p>
          ) : null}

          {estado.sucesso ? (
            <p
              role="status"
              className="flex items-start gap-2 rounded-sm bg-positive-soft px-3 py-2 text-sm text-positive-strong"
            >
              <Check className="mt-0.5 size-4 shrink-0" aria-hidden />
              {estado.sucesso}
            </p>
          ) : null}

          <Button type="submit" loading={enviando} className="self-start">
            Enviar convite
          </Button>

          <p className="text-xs text-ink-muted">
            O convite vale 7 dias e serve uma vez só. Ninguém cria conta sozinho neste sistema.
          </p>
        </form>
      </CardBody>
    </Card>
  );
}
