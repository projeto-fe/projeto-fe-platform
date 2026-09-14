import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { CampoDeSenha } from "./campo-de-senha";

describe("CampoDeSenha", () => {
  it("começa oculto e revela ao acionar o olho", async () => {
    const usuario = userEvent.setup();
    render(<CampoDeSenha id="senha" name="senha" rotulo="Senha" />);

    const campo = screen.getByLabelText("Senha");
    expect(campo).toHaveAttribute("type", "password");

    await usuario.click(screen.getByRole("button", { name: "Mostrar senha" }));
    expect(campo).toHaveAttribute("type", "text");

    await usuario.click(screen.getByRole("button", { name: "Ocultar senha" }));
    expect(campo).toHaveAttribute("type", "password");
  });

  // O botão fica dentro do formulário. Sem type="button" ele enviaria o
  // formulário a cada vez que alguém quisesse conferir o que digitou.
  it("não envia o formulário ao alternar a visibilidade", () => {
    render(<CampoDeSenha id="senha" name="senha" rotulo="Senha" />);
    expect(screen.getByRole("button", { name: "Mostrar senha" })).toHaveAttribute(
      "type",
      "button",
    );
  });
});
