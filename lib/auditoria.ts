import { criarClienteAdministrativo } from "@/lib/supabase/server";

type Registro = {
  atorId: string;
  acao: string;
  entidade: string;
  entidadeId?: string;
  detalhe?: Record<string, unknown>;
  /** Ações que concedem acesso ou tocam dado de criança são marcadas. */
  sensivel?: boolean;
};

/**
 * Grava no log de auditoria.
 *
 * Usa o papel de serviço porque nenhum usuário tem permissão de escrita nessa
 * tabela: o registro não pode depender de quem praticou a ação querer que ele
 * exista. Falha aqui nunca derruba a operação que estava sendo auditada, mas
 * aparece no log do servidor.
 */
export async function registrarAuditoria(registro: Registro) {
  try {
    const supabase = criarClienteAdministrativo();
    const { error } = await supabase.from("auditoria").insert({
      ator_id: registro.atorId,
      acao: registro.acao,
      entidade: registro.entidade,
      entidade_id: registro.entidadeId ?? null,
      detalhe: registro.detalhe ?? null,
      sensivel: registro.sensivel ?? false,
    });

    if (error) console.error("[auditoria] não gravou:", error.message);
  } catch (erro) {
    console.error("[auditoria] não gravou:", erro);
  }
}
