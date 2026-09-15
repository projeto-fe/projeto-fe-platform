import { NextResponse } from "next/server";

import { baixarArquivo } from "@/lib/arquivos-dados";
import { exigirPessoaLogada } from "@/lib/sessao";

/**
 * Serve documento institucional (guia cultural e o que mais vier). Mesma
 * decisão da rota de fotos: bucket privado sem policy de `authenticated`,
 * então esta rota é o único caminho de leitura, e exige sessão ativa.
 */
export async function GET(
  _requisicao: Request,
  { params }: { params: Promise<{ caminho: string[] }> },
) {
  await exigirPessoaLogada();

  const { caminho } = await params;
  const alvo = caminho.join("/");

  if (!/^institucional\/[a-z0-9-]+$/.test(alvo)) {
    return new NextResponse(null, { status: 404 });
  }

  const dado = await baixarArquivo(alvo);
  if (!dado) return new NextResponse(null, { status: 404 });

  return new NextResponse(dado, {
    headers: {
      "Content-Type": dado.type || "application/octet-stream",
      // "inline" abre no navegador (PDF, imagem); quem quiser baixar usa o
      // botão de salvar do próprio visualizador. Sem cache pelo mesmo
      // motivo da rota de fotos: o caminho não muda quando o arquivo troca.
      "Content-Disposition": "inline",
      "Cache-Control": "private, no-store",
    },
  });
}
