#!/usr/bin/env bash
set -euo pipefail

message="${1:-chore: sincronizar atualização validada}"

if [[ -z "$(git status --porcelain)" ]]; then
  echo "Não há alterações para sincronizar."
  exit 0
fi

pnpm check
pnpm test
pnpm build

git add -A
git commit -m "$message"
git push github main

echo "Alterações validadas e sincronizadas com GitHub."
