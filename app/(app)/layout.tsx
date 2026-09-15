import { AppShell } from "@/components/shell/app-shell";
import { exigirPessoaLogada } from "@/lib/sessao";

export default async function LayoutAutenticado({
  children,
}: {
  children: React.ReactNode;
}) {
  const pessoa = await exigirPessoaLogada();

  return (
    <AppShell usuario={{ id: pessoa.id, nome: pessoa.nome, papel: pessoa.papel, isAdmin: pessoa.isAdmin }}>
      {children}
    </AppShell>
  );
}
