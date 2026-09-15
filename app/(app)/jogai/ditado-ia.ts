"use server";

import { GoogleGenAI, Type } from "@google/genai";

import { exigirPessoaLogada } from "@/lib/sessao";

export type SugestaoDeLancamento = {
  criancaId: string | null;
  atividadeId: string | null;
  motivoId: string | null;
  erro?: string;
};

const SEM_SUGESTAO: SugestaoDeLancamento = { criancaId: null, atividadeId: null, motivoId: null };

const ESQUEMA_DA_SUGESTAO = {
  type: Type.OBJECT,
  properties: {
    crianca_id: { type: Type.STRING, nullable: true },
    atividade_id: { type: Type.STRING, nullable: true },
    motivo_id: { type: Type.STRING, nullable: true },
  },
  required: ["crianca_id", "atividade_id", "motivo_id"],
};

function montarPrompt(
  texto: string,
  contexto: {
    criancas: { id: string; nome_completo: string }[];
    atividades: { id: string; nome: string }[];
    motivos: { id: string; rotulo: string; valor: number }[];
  },
) {
  const listar = <T,>(itens: T[], linha: (item: T) => string) =>
    itens.length > 0 ? itens.map(linha).join("\n") : "(nenhuma cadastrada)";

  return `Um voluntário de um instituto para crianças ditou o que aconteceu, para lançar pontos.

Texto ditado: "${texto}"

Crianças ativas:
${listar(contexto.criancas, (c) => `- ${c.id}: ${c.nome_completo}`)}

Atividades ativas:
${listar(contexto.atividades, (a) => `- ${a.id}: ${a.nome}`)}

Motivos de pontuação cadastrados:
${listar(contexto.motivos, (m) => `- ${m.id}: ${m.rotulo} (${m.valor > 0 ? "+" : ""}${m.valor} pontos)`)}

Identifique qual criança foi citada, qual atividade (se alguma foi citada) e qual motivo mais
combina com o que foi dito. Responda só com o id exato de cada lista acima, nunca invente um id
que não esteja listado. Se o texto não citar aquele campo, ou mais de um item combinar igualmente
bem (por exemplo, duas crianças com o mesmo nome), devolva null naquele campo em vez de arriscar.`;
}

/**
 * ADR 0015: o texto ditado, que agora pode conter o nome da criança, vai para
 * o Gemini com as listas de crianças, atividades e motivos ativos. Qualquer
 * id que a resposta trouxer fora dessas listas é descartado aqui mesmo,
 * nunca chega à tela: o modelo nunca decide um id livremente.
 */
export async function identificarLancamento(
  texto: string,
  contexto: {
    criancas: { id: string; nome_completo: string }[];
    atividades: { id: string; nome: string }[];
    motivos: { id: string; rotulo: string; valor: number }[];
  },
): Promise<SugestaoDeLancamento> {
  await exigirPessoaLogada();

  if (!texto.trim()) return SEM_SUGESTAO;
  if (!process.env.GEMINI_API_KEY) return SEM_SUGESTAO;

  try {
    const cliente = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const resposta = await cliente.models.generateContent({
      model: "gemini-3.6-flash",
      contents: montarPrompt(texto, contexto),
      config: {
        responseMimeType: "application/json",
        responseSchema: ESQUEMA_DA_SUGESTAO,
      },
    });

    const bruto = JSON.parse(resposta.text ?? "{}") as {
      crianca_id?: string | null;
      atividade_id?: string | null;
      motivo_id?: string | null;
    };

    const idsDeCriancas = new Set(contexto.criancas.map((c) => c.id));
    const idsDeAtividades = new Set(contexto.atividades.map((a) => a.id));
    const idsDeMotivos = new Set(contexto.motivos.map((m) => m.id));

    return {
      criancaId: bruto.crianca_id && idsDeCriancas.has(bruto.crianca_id) ? bruto.crianca_id : null,
      atividadeId:
        bruto.atividade_id && idsDeAtividades.has(bruto.atividade_id) ? bruto.atividade_id : null,
      motivoId: bruto.motivo_id && idsDeMotivos.has(bruto.motivo_id) ? bruto.motivo_id : null,
    };
  } catch {
    return { ...SEM_SUGESTAO, erro: "Não foi possível identificar automaticamente. Preencha à mão." };
  }
}
