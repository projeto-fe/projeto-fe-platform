#!/usr/bin/env bash
#
# Sobe um Postgres efêmero, aplica todas as migrations e roda os testes de
# acesso. Não toca em nenhum banco remoto.
#
# Existe porque política de RLS que "parece certa" na leitura do SQL pode ser
# decorativa na prática. A única forma de saber é rodar contra um Postgres de
# verdade e tentar o acesso indevido.
#
#   ./scripts/test-db.sh
#
set -euo pipefail

RAIZ="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PORTA="${PGTEST_PORT:-54329}"
# caminho curto de propósito: socket unix estoura 103 bytes com facilidade
SOCK="/tmp/pf-test-${PORTA}"
DADOS="$(mktemp -d "${TMPDIR:-/tmp}/pf-pgdata.XXXXXX")"

limpar() {
  pg_ctl -D "$DADOS" stop -m immediate > /dev/null 2>&1 || true
  rm -rf "$DADOS" "$SOCK"
}
trap limpar EXIT

command -v initdb > /dev/null || { echo "initdb não encontrado. Instale o Postgres."; exit 1; }

echo "Subindo Postgres efêmero na porta ${PORTA}..."
initdb -D "$DADOS" -U postgres --auth=trust > /dev/null
rm -rf "$SOCK"; mkdir -p "$SOCK"
pg_ctl -D "$DADOS" -o "-p ${PORTA} -k ${SOCK} -c listen_addresses=" -l "$DADOS/server.log" start > /dev/null
sleep 2

createdb -h "$SOCK" -p "$PORTA" -U postgres pf

echo "Aplicando stub do ambiente Supabase..."
psql -h "$SOCK" -p "$PORTA" -U postgres -d pf -v ON_ERROR_STOP=1 -q \
  -f "$RAIZ/supabase/tests/00-stub-supabase.sql"

echo "Aplicando migrations..."
for arquivo in "$RAIZ"/supabase/migrations/*.sql; do
  echo "  $(basename "$arquivo")"
  psql -h "$SOCK" -p "$PORTA" -U postgres -d pf -v ON_ERROR_STOP=1 -q -f "$arquivo"
done

echo ""
echo "Rodando testes de acesso..."
psql -h "$SOCK" -p "$PORTA" -U postgres -d pf -v ON_ERROR_STOP=1 -q -t -A \
  -f "$RAIZ/supabase/tests/01-acesso.sql" 2>&1 \
  | sed -E 's/^psql:.*: (NOTICE|ERROR):  //' \
  | grep -vE '^\s*$'

echo ""
echo "Banco de teste destruído."
