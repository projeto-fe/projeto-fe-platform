import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AppShell } from "./app-shell";

vi.mock("next/navigation", () => ({ usePathname: () => "/" }));
vi.mock("@/app/(app)/conta/actions", () => ({ sair: vi.fn() }));

const admin = { id: "11111111-1111-1111-1111-111111111111", nome: "Matheus Rezende", papel: "Administrador", isAdmin: true };
const voluntario = { id: "22222222-2222-2222-2222-222222222222", nome: "Rafael Nogueira", papel: "Voluntário", isAdmin: false };

function barraLateral() {
  return screen.getByRole("complementary");
}

function barraInferior() {
  // a barra lateral também é nav, então pega a última
  const navs = screen.getAllByRole("navigation");
  return navs[navs.length - 1];
}

describe("AppShell", () => {
  it("mostra administração para quem é administrador", () => {
    render(
      <AppShell usuario={admin}>
        <span />
      </AppShell>,
    );
    expect(within(barraLateral()).getByRole("link", { name: /Pessoas e acessos/ })).toBeVisible();
  });

  // Esconder o item não é a proteção: quem protege é o banco. Mas mostrar um
  // link que sempre vai falhar é defeito de produto.
  it("esconde administração de quem não é administrador", () => {
    render(
      <AppShell usuario={voluntario}>
        <span />
      </AppShell>,
    );
    expect(within(barraLateral()).queryByRole("link", { name: /Pessoas e acessos/ })).toBeNull();
  });

  it("não repete na barra lateral o que existe no menu da conta", () => {
    render(
      <AppShell usuario={admin}>
        <span />
      </AppShell>,
    );
    expect(within(barraLateral()).queryByRole("link", { name: "Minha conta" })).toBeNull();
  });

  it("dá ao celular os cinco destinos, incluindo o calendário", () => {
    render(
      <AppShell usuario={voluntario}>
        <span />
      </AppShell>,
    );
    const links = within(barraInferior()).getAllByRole("link");
    expect(links).toHaveLength(5);
    expect(links.map((l) => l.getAttribute("href"))).toEqual([
      "/",
      "/criancas",
      "/jogai",
      "/calendario",
      "/estrutura",
    ]);
  });

  it("a conta some da barra inferior, mas continua alcançável pelo avatar do topo", () => {
    render(
      <AppShell usuario={voluntario}>
        <span />
      </AppShell>,
    );
    expect(within(barraInferior()).queryByRole("link", { name: /conta/i })).toBeNull();
    expect(screen.getByRole("button", { name: `Conta de ${voluntario.nome}` })).toBeVisible();
  });

  it("marca a rota atual para leitores de tela", () => {
    render(
      <AppShell usuario={admin}>
        <span />
      </AppShell>,
    );
    const inicio = within(barraLateral()).getByRole("link", { name: "Início" });
    expect(inicio).toHaveAttribute("aria-current", "page");
  });
});
