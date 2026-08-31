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

if [[ ! -d "$corelib" ]]; then
  printf 'corelib not found: %s\n' "$corelib" >&2
  exit 1
fi

if [[ ! -d "$ui" ]]; then
  printf 'ui not found: %s\n' "$ui" >&2
  exit 1
fi

# Override the filesystem table with an inline TOML table. Config layers merge
# recursively, so these entries augment the committed profile. Using an inline
# table also avoids the CLI dotted-key problem for filesystem path keys.
external_fs=$(printf '{"%s"="read","%s"="read"}' "$corelib" "$ui")

exec codex \
  -c "permissions.leaonline-workspace.filesystem=$external_fs" \
  "$@"
