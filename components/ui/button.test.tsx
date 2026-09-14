import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Button } from "./button";

describe("Button", () => {
  it("nasce como ação primária quando nenhuma variante é passada", () => {
    render(<Button>Salvar</Button>);
    expect(screen.getByRole("button", { name: "Salvar" })).toHaveClass("bg-action");
  });

  it("usa a cor de marca só quando pedida", () => {
    render(<Button variant="brand">Lançar ponto</Button>);
    expect(screen.getByRole("button", { name: "Lançar ponto" })).toHaveClass("bg-brand");
  });

  // Regressão: com asChild o Radix Slot exige um único filho, e acrescentar o
  // indicador de carregamento ao lado quebrava a renderização inteira da página.
  it("aceita asChild com um link sem quebrar", () => {
    render(
      <Button asChild size="sm">
        <a href="/criancas/nova">Nova criança</a>
      </Button>,
    );

    const link = screen.getByRole("link", { name: "Nova criança" });
    expect(link).toHaveAttribute("href", "/criancas/nova");
    expect(link).toHaveClass("bg-action");
  });

  it("desabilita e mostra progresso enquanto envia", () => {
    render(<Button loading>Entrando</Button>);
    expect(screen.getByRole("button", { name: /Entrando/ })).toBeDisabled();
  });
});
