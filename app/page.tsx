import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Página temporária de verificação do design system.
 * Sai quando as rotas reais entrarem (ver docs/specs).
 */
export default function Home() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-10">
      <header className="flex flex-col gap-1">
        <span className="font-display text-[0.6875rem] font-semibold tracking-[0.22em] text-ink-muted">
          INSTITUTO
        </span>
        <h1 className="font-display text-2xl font-extrabold">
          PROJETO <span className="text-brand">FÉ</span>
        </h1>
        <p className="text-sm text-ink-muted">
          Base do design system instalada. Tokens, componentes e verificação no lugar.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Ações</CardTitle>
        </CardHeader>
        <CardBody className="flex flex-wrap items-center gap-2">
          <Button>Salvar cadastro</Button>
          <Button variant="brand">Lançar ponto</Button>
          <Button variant="outline">Cancelar</Button>
          <Button variant="ghost">Ver extrato</Button>
          <Button loading>Enviando</Button>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Estado</CardTitle>
        </CardHeader>
        <CardBody className="flex flex-wrap items-center gap-2">
          <Badge variant="brand">Área</Badge>
          <Badge variant="positive">Coordenadora</Badge>
          <Badge variant="negative">Estornado</Badge>
          <Badge variant="warning">Autorização pendente</Badge>
          <Badge>Voluntário</Badge>
        </CardBody>
      </Card>

      <p className="text-xs text-ink-muted">
        Alterne o tema do sistema entre claro e escuro para conferir que nenhum componente precisou
        saber disso.
      </p>
    </main>
  );
}
