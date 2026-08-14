#!/usr/bin/env bash
set -euo pipefail

forbidden_files='(^|/)(\.env($|\.)|.*\.(pem|key|p12|pfx|crt)$|.*\.(db|sqlite|sqlite3)$|.*credentials.*$)'
secret_patterns='(AKIA[0-9A-Z]{16}|AIza[0-9A-Za-z_-]{35}|gh[pousr]_[A-Za-z0-9_]{20,}|BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY)'

tracked_forbidden="$(git ls-files | grep -EI "$forbidden_files" || true)"
if [[ -n "$tracked_forbidden" ]]; then
  echo "Falha de segurança: arquivos proibidos estão rastreados:" >&2
  echo "$tracked_forbidden" >&2
  exit 1
fi

secret_hits="$(git grep -nIE "$secret_patterns" -- ':!pnpm-lock.yaml' ':!scripts/check-publication-safety.sh' || true)"
if [[ -n "$secret_hits" ]]; then
  echo "Falha de segurança: padrão de segredo encontrado:" >&2
  echo "$secret_hits" >&2
  exit 1
fi

echo "Verificação de publicação segura concluída."
