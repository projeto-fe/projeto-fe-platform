#!/usr/bin/env bash
#
# Aplica migrations no projeto Supabase remoto vinculado, exigindo o alvo por
# argumento mesmo assim.
#
#   ./scripts/db-push.sh <project-ref>
#
# `supabase db push` não aceita mais `--project-ref` a partir da versão 2.x
# do CLI: só sabe empurrar para o projeto vinculado no momento (`--linked`).
# Isso reabre exatamente o risco que este script existia para fechar — um
# `supabase link` esquecido em outro projeto faria o push cair lá em vez de
# no alvo pretendido, sem aviso nenhum. Por isso o script confere, antes de
# empurrar qualquer coisa, que o projeto vinculado agora é o mesmo ref
# digitado.
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

VINCULADO=$(supabase projects list -o json \
  | python3 -c "import json,sys; d=json.load(sys.stdin); print(next((p['ref'] for p in d if p.get('linked')), ''))")

if [[ "$VINCULADO" != "$REF" ]]; then
  echo "O projeto vinculado agora é '${VINCULADO:-nenhum}', não '${REF}'." >&2
  echo "Rode 'supabase link --project-ref ${REF}' antes de tentar de novo." >&2
  exit 1
fi

echo "Antes de aplicar em banco remoto, rodando os testes locais..."
./scripts/test-db.sh > /dev/null || { echo "Testes falharam. Nada foi aplicado."; exit 1; }
echo "Testes passaram."
echo ""

read -r -p "Aplicar migrations em ${REF}? (digite o ref para confirmar) " CONFIRMA
if [[ "$CONFIRMA" != "$REF" ]]; then
  echo "Confirmação não bateu. Nada foi aplicado."
  exit 1
fi

supabase db push --linked
