#!/usr/bin/env bash
#
# Aplica migrations num projeto Supabase remoto, exigindo o alvo por argumento.
#
#   ./scripts/db-push.sh <project-ref>
#
# O CLI do Supabase usa o project_id do config.toml como alvo e NÃO verifica
# contra qual servidor está falando. Já aconteceu de um comando sem alvo
# explícito atingir produção mesmo depois de um `supabase link` em outro
# ambiente. Por isso este script recusa rodar sem o ref na linha de comando.
#
set -euo pipefail

REF="${1:-}"

if [[ -z "$REF" ]]; then
  cat >&2 <<'USO'
Falta o project-ref.

  ./scripts/db-push.sh <project-ref>

O ref aparece na URL do painel:
  https://supabase.com/dashboard/project/<project-ref>
USO
  exit 1
fi

RAIZ="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$RAIZ"

echo "Alvo: $REF"
echo "Antes de aplicar em banco remoto, rodando os testes locais..."
./scripts/test-db.sh > /dev/null || { echo "Testes falharam. Nada foi aplicado."; exit 1; }
echo "Testes passaram."
echo ""

read -r -p "Aplicar migrations em ${REF}? (digite o ref para confirmar) " CONFIRMA
if [[ "$CONFIRMA" != "$REF" ]]; then
  echo "Confirmação não bateu. Nada foi aplicado."
  exit 1
fi

supabase db push --project-ref "$REF"
