import type { Metadata } from "next";
import { CalendarDays } from "lucide-react";

import { GradeDoMes } from "@/components/calendario/grade-do-mes";
import { carregarAgendaPublica } from "@/lib/calendario-dados";
import { mesReferenciaDoParametro } from "@/lib/calendario";

export const metadata: Metadata = {
  title: { absolute: "Agenda · Instituto Projeto Fé" },
  description: "Cronograma das atividades do Instituto Projeto Fé, em Marília/SP.",
  robots: { index: true, follow: true },
};

// Mesmo motivo do ranking: a agenda muda ao longo do mês, e gerar no build
// exigiria a chave de serviço na hora de compilar.
export const dynamic = "force-dynamic";

/**
 * Segunda página pública do sistema (ADR 0013). Mostra apenas atividade,
 * área, horário e local: nenhuma criança, voluntário ou presença aparece
 * aqui (Spec 0005).
 */
export default async function AgendaPublica({
  searchParams,
}: {
  searchParams: Promise<{ mes?: string }>;
}) {
  const { mes } = await searchParams;
  const referencia = mesReferenciaDoParametro(mes);
  const agenda = await carregarAgendaPublica(referencia);

  return (
    <main>
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-1 px-5 pt-4 pb-6 md:px-8">
        <h1 className="font-display text-4xl font-semibold tracking-tight">Agenda</h1>
        <p className="text-base text-brand-canvas-ink/60">Cronograma das atividades do Instituto</p>
      </div>

      <div className="mx-auto w-full max-w-2xl px-5 pb-12 md:px-8">
        {agenda.size === 0 && (
          <div className="mb-4 flex items-center gap-3 rounded-lg border border-brand-canvas-ink/10 bg-brand-canvas-ink/5 px-4 py-3 text-sm text-brand-canvas-ink/70">
            <CalendarDays className="size-4 shrink-0" aria-hidden />
            Nenhuma atividade com horário cadastrado neste mês.
          </div>
        )}

        <GradeDoMes referencia={referencia} agenda={agenda} hrefBase="/agenda" tom="publico" />

        <p className="mx-auto mt-6 max-w-[52ch] text-center text-xs leading-relaxed text-brand-canvas-ink/50">
          Nome de criança, de voluntário e presença não aparecem aqui: só o cronograma das
          atividades.
        </p>
      </div>
    </main>
  );
}
