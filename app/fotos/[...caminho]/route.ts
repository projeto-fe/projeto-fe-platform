import { NextResponse } from "next/server";

import { baixarFoto } from "@/lib/fotos-dados";
import { exigirPessoaLogada } from "@/lib/sessao";

/**
 * Serve a foto de criança ou de usuário. O bucket é privado e sem policy de
 * `authenticated`, então esta rota é o único caminho de leitura, e quem
 * chega aqui precisa estar logado e ativo — mesma checagem de qualquer
 * página do portal. Sem restrição extra por tipo: as duas fotos são
 * visíveis para toda a equipe (decisão ao lado da Spec 0001).
 */
export async function GET(
  _requisicao: Request,
  { params }: { params: Promise<{ caminho: string[] }> },
) {
  await exigirPessoaLogada();

  const { caminho } = await params;
  const alvo = caminho.join("/");

  if (!/^(criancas|perfis)\/[0-9a-f-]{36}$/.test(alvo)) {
    return new NextResponse(null, { status: 404 });
  }

  const dado = await baixarFoto(alvo);
  if (!dado) return new NextResponse(null, { status: 404 });

  return new NextResponse(dado, {
    headers: {
      "Content-Type": dado.type || "application/octet-stream",
      // Sem cache: o caminho não muda quando a foto é trocada (upsert no
      // mesmo lugar), então cachear aqui mostraria a foto velha depois de
      // trocar ou remover. Nesta escala, buscar de novo a cada visita é
      // barato o suficiente para não valer a complicação de um ETag.
      "Cache-Control": "private, no-store",
    },
  });
}
