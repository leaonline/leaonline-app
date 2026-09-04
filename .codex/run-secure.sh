#!/usr/bin/env bash
set -euo pipefail

# Launch Codex with the two external package repositories exposed READ-only,
# while keeping them outside :workspace_roots.
#
# This avoids hard-coding machine-specific absolute paths in the committed
# .codex/config.toml. Codex 0.151.0 requires normal filesystem permission
# entries to be absolute (or ~/...), so resolve them here.

workspace="$(git rev-parse --show-toplevel)"

corelib="$(realpath "$workspace/../lib/corelib")"
ui="$(realpath "$workspace/../lib/ui")"
otulea="$(realpath "$workspace/../leaonline-otulea")"

external_repositories=(
  "$corelib"
  "$ui"
  "$otulea"
)

for repo in "${external_repositories[@]}"; do
  if [[ ! -d "$repo" ]]; then
    printf 'External repository not found: %s\n' "$repo" >&2
    exit 1
  fi
done

external_fs=$(printf \
  '{"%s"="read","%s"="read","%s"="read"}' \
  "$corelib" \
  "$ui" \
  "$otulea"
)

exec codex \
  -c "permissions.leaonline-workspace.filesystem=$external_fs" \
  "$@"