#!/usr/bin/env bash
set -u

# Codex 0.151.0 security + multi-agent configuration test.
#
# Default:
#   ./test.sh [WORKSPACE]
#
# Include a real (model-using) implementer/reviewer smoke test:
#   ./test.sh --agent-smoke [WORKSPACE]
#
# The agent smoke test intentionally runs without --ephemeral because custom
# sub-agent spawning has had thread-registration issues in ephemeral exec mode.
#
# Optional overrides:
#   CODEX_LAUNCHER=/path/to/run-secure.sh ./test.sh
#   CODEX_AGENT_SMOKE=1 ./test.sh
#
# Expected security model:
#   leaonline-app ordinary files     READ + WRITE
#   .deploy contents                 NO READ/WRITE
#   .staging contents                NO READ/WRITE
#   ~/.deployment                    NO ACCESS
#   unrelated $HOME                  NO ACCESS
#   Codex standalone runtime         READ ONLY
#   ../lib/corelib                   READ ONLY
#   ../lib/ui                        READ ONLY
#   network                          ENABLED
#
# Native Codex sub-agents inherit the parent permission profile in Codex
# 0.151.0. The reviewer role is therefore behaviorally read-only; this script
# verifies its role instructions and can optionally verify that both custom
# roles can actually be spawned.

pass=0
fail=0
warn=0

green='\033[0;32m'
red='\033[0;31m'
yellow='\033[0;33m'
reset='\033[0m'

AGENT_SMOKE="${CODEX_AGENT_SMOKE:-0}"
WORKSPACE=""

usage() {
  cat <<'EOF'
Usage:
  test.sh [--agent-smoke] [WORKSPACE]

Options:
  --agent-smoke   Run a real Codex multi-agent smoke test. This uses model
                  quota and creates a normal Codex exec session.
  -h, --help      Show this help.

Environment:
  CODEX_LAUNCHER  Codex launcher command. Defaults to
                  WORKSPACE/.codex/run-secure.sh when executable, otherwise
                  falls back to `codex`.
  CODEX_AGENT_SMOKE=1
                  Equivalent to --agent-smoke.
EOF
}

for arg in "$@"; do
  case "$arg" in
    --agent-smoke)
      AGENT_SMOKE=1
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    -*)
      printf 'Unknown option: %s\n' "$arg" >&2
      usage >&2
      exit 2
      ;;
    *)
      if [[ -n "$WORKSPACE" ]]; then
        printf 'Only one WORKSPACE argument is supported.\n' >&2
        exit 2
      fi
      WORKSPACE="$arg"
      ;;
  esac
done

WORKSPACE="${WORKSPACE:-$PWD}"

ok() {
  printf "${green}PASS${reset} %s\n" "$1"
  pass=$((pass + 1))
}

bad() {
  printf "${red}FAIL${reset} %s\n" "$1"
  fail=$((fail + 1))
}

warning() {
  printf "${yellow}WARN${reset} %s\n" "$1"
  warn=$((warn + 1))
}

if [[ ! -d "$WORKSPACE" ]]; then
  echo "Workspace does not exist: $WORKSPACE" >&2
  exit 2
fi

cd "$WORKSPACE" || exit 2
WORKSPACE="$PWD"

# Prefer the project launcher because it augments the committed permission
# profile with absolute read-only paths for ../lib/corelib and ../lib/ui.
if [[ -n "${CODEX_LAUNCHER:-}" ]]; then
  CODEX_CMD=("$CODEX_LAUNCHER")
elif [[ -x ".codex/run-secure.sh" ]]; then
  CODEX_CMD=("$WORKSPACE/.codex/run-secure.sh")
else
  CODEX_CMD=(codex)
  warning ".codex/run-secure.sh not found; using codex directly"
fi

run_codex() {
  "${CODEX_CMD[@]}" "$@"
}

run_in_sandbox() {
  run_codex sandbox -- bash -lc "$1"
}

printf 'Testing Codex security and agent configuration for:\n  %s\n' "$WORKSPACE"
printf 'Codex command:\n  %s\n\n' "${CODEX_CMD[*]}"

# --------------------------------------------------------------------
# 0. Codex version
# --------------------------------------------------------------------

codex_version="$(codex --version 2>/dev/null || true)"

if [[ "$codex_version" == *"0.151.0"* ]]; then
  ok "Codex CLI version is 0.151.0"
elif [[ -n "$codex_version" ]]; then
  warning "test targets Codex 0.151.0; installed version is: $codex_version"
else
  bad "unable to determine Codex CLI version"
fi

# --------------------------------------------------------------------
# 1. Required configuration files
# --------------------------------------------------------------------

config=".codex/config.toml"
implementer_cfg=".codex/agents/implementer.toml"
reviewer_cfg=".codex/agents/reviewer.toml"

for f in "$config" "$implementer_cfg" "$reviewer_cfg" "AGENTS.md" "DOMAIN.md"; do
  if [[ -r "$f" ]]; then
    ok "$f exists and is readable"
  else
    bad "$f is missing or unreadable"
  fi
done

# --------------------------------------------------------------------
# 2. Permission profile must still be the primary security boundary
# --------------------------------------------------------------------

if [[ -r "$config" ]]; then
  if grep -Eq '^[[:space:]]*default_permissions[[:space:]]*=[[:space:]]*"leaonline-workspace"[[:space:]]*$' "$config"; then
    ok "leaonline-workspace remains the default permission profile"
  else
    bad "default permission profile is not leaonline-workspace"
  fi

  if grep -Eq '^[[:space:]]*":root"[[:space:]]*=[[:space:]]*"deny"[[:space:]]*$' "$config"; then
    ok 'filesystem default remains ":root" = "deny"'
  else
    bad 'filesystem root deny rule is missing'
  fi

  if grep -Eq '^[[:space:]]*":minimal"[[:space:]]*=[[:space:]]*"read"[[:space:]]*$' "$config"; then
    ok 'minimal Codex runtime access remains read-only'
  else
    bad '":minimal" = "read" rule is missing'
  fi

  if grep -Eq '^[[:space:]]*"~/.codex/packages/standalone/releases/"[[:space:]]*=[[:space:]]*"read"[[:space:]]*$' "$config"; then
    ok "standalone Codex runtime is explicitly read-only"
  else
    bad "standalone Codex runtime read rule is missing"
  fi

  if grep -Eq '^[[:space:]]*"\."[[:space:]]*=[[:space:]]*"write"[[:space:]]*$' "$config"; then
    ok "only project workspace root is explicitly writable"
  else
    bad 'workspace "." write rule is missing'
  fi

  if grep -Eq '^[[:space:]]*approval_policy[[:space:]]*=[[:space:]]*"never"[[:space:]]*$' "$config"; then
    ok "unattended approval policy fails closed"
  else
    warning 'approval_policy = "never" not found'
  fi
fi

# --------------------------------------------------------------------
# 3. Multi-agent configuration
# --------------------------------------------------------------------

if [[ -r "$config" ]]; then
  if grep -Eq '^[[:space:]]*multi_agent[[:space:]]*=[[:space:]]*true[[:space:]]*$' "$config"; then
    ok "multi-agent feature is enabled"
  else
    bad "multi-agent feature is not enabled"
  fi

  if grep -Eq '^[[:space:]]*max_concurrent_threads_per_session[[:space:]]*=[[:space:]]*[2-9][0-9]*[[:space:]]*$' "$config"; then
    ok "at least two concurrent agent threads are configured"
  else
    bad "max_concurrent_threads_per_session is missing or below 2"
  fi

  if grep -Eq '^[[:space:]]*\[agents\.implementer\][[:space:]]*$' "$config" &&
     grep -Eq '^[[:space:]]*config_file[[:space:]]*=[[:space:]]*"agents/implementer\.toml"[[:space:]]*$' "$config"; then
    ok "implementer custom role is configured"
  else
    bad "implementer custom role configuration is missing"
  fi

  if grep -Eq '^[[:space:]]*\[agents\.reviewer\][[:space:]]*$' "$config" &&
     grep -Eq '^[[:space:]]*config_file[[:space:]]*=[[:space:]]*"agents/reviewer\.toml"[[:space:]]*$' "$config"; then
    ok "reviewer custom role is configured"
  else
    bad "reviewer custom role configuration is missing"
  fi
fi

# Role-level permission/sandbox keys are misleading in Codex 0.151.0 because
# native sub-agents inherit the parent permission profile.
for role_cfg in "$implementer_cfg" "$reviewer_cfg"; do
  if [[ -r "$role_cfg" ]] &&
     grep -Eq '^[[:space:]]*(sandbox_mode|approval_policy|default_permissions)[[:space:]]*=' "$role_cfg"; then
    bad "$role_cfg contains role-local permission/sandbox settings"
  elif [[ -r "$role_cfg" ]]; then
    ok "$role_cfg does not pretend to override inherited filesystem authority"
  fi
done

# Validate the intended behavioral separation.
if [[ -r "$implementer_cfg" ]] &&
   grep -qi 'implementation agent' "$implementer_cfg" &&
   grep -qi 'modify only files in the leaonline-app workspace' "$implementer_cfg"; then
  ok "implementer role is constrained to application-workspace changes"
else
  bad "implementer role instructions do not clearly constrain write scope"
fi

for ref in '../lib/corelib' '../lib/ui' '../leaonline-otulea'; do
  if grep -Fqi -- "$ref" "$implementer_cfg"; then
    ok "implementer role references $ref"
  else
    bad "implementer role does not mention $ref"
  fi
done

if [[ -r "$reviewer_cfg" ]] &&
   grep -qi 'strictly read-only' "$reviewer_cfg" &&
   grep -qi 'do not edit' "$reviewer_cfg" &&
   grep -qi 'do not implement' "$reviewer_cfg"; then
  ok "reviewer role is behaviorally read-only"
else
  bad "reviewer role does not clearly enforce read-only behavior by instruction"
fi

# --------------------------------------------------------------------
# 4. Workspace must be readable
# --------------------------------------------------------------------

if run_in_sandbox 'test -r . && ls . >/dev/null 2>&1'; then
  ok "workspace is readable"
else
  bad "workspace is not readable"
fi

# --------------------------------------------------------------------
# 5. Workspace must be writable
# --------------------------------------------------------------------

test_file=".codex-permission-test-$$"

if run_in_sandbox "touch '$test_file' && rm '$test_file'"; then
  ok "workspace is writable"
else
  bad "workspace is not writable"
fi

rm -f "$test_file"

# --------------------------------------------------------------------
# 6. .deploy contents must not be readable
# --------------------------------------------------------------------

if [[ -L .deploy || -e .deploy ]]; then
  if run_in_sandbox 'test -r .deploy/ 2>/dev/null || ls .deploy/ >/dev/null 2>&1'; then
    bad ".deploy contents are readable"
  else
    ok ".deploy contents are inaccessible"
  fi

  if [[ -L .deploy ]]; then
    warning ".deploy symlink itself remains replaceable because it is inside the writable workspace"
  fi
else
  warning ".deploy does not exist"
fi

# --------------------------------------------------------------------
# 7. .staging contents must not be readable
# --------------------------------------------------------------------

if [[ -L .staging || -e .staging ]]; then
  if run_in_sandbox 'test -r .staging/ 2>/dev/null || ls .staging/ >/dev/null 2>&1'; then
    bad ".staging contents are readable"
  else
    ok ".staging contents are inaccessible"
  fi

  if [[ -L .staging ]]; then
    warning ".staging symlink itself remains replaceable because it is inside the writable workspace"
  fi
else
  warning ".staging does not exist"
fi

# --------------------------------------------------------------------
# 8. External deployment storage must not be readable
# --------------------------------------------------------------------

if run_in_sandbox 'test -r "$HOME/.deployment" || ls "$HOME/.deployment" >/dev/null 2>&1'; then
  bad "~/.deployment is readable"
else
  ok "~/.deployment is inaccessible"
fi

# --------------------------------------------------------------------
# 9. Common sensitive HOME locations must not be readable
# --------------------------------------------------------------------

sensitive_paths=(
  '$HOME/.ssh'
  '$HOME/.config'
  '$HOME/.local'
  '$HOME/.bashrc'
  '$HOME/.profile'
  '$HOME/.gitconfig'
  '$HOME/.codex/auth.json'
)

for path in "${sensitive_paths[@]}"; do
  if run_in_sandbox "test -r $path"; then
    bad "$path is readable"
  else
    ok "$path is inaccessible"
  fi
done

# --------------------------------------------------------------------
# 10. Codex standalone runtime must remain readable/executable
# --------------------------------------------------------------------

if run_in_sandbox '
  found=0
  for f in "$HOME"/.codex/packages/standalone/releases/*/bin/codex; do
    if [ -x "$f" ]; then
      found=1
      break
    fi
  done
  test "$found" -eq 1
'; then
  ok "Codex standalone runtime is accessible"
else
  bad "Codex standalone runtime is inaccessible"
fi

# Runtime must not become writable.
runtime_probe="$HOME/.codex/packages/standalone/releases/.codex-write-test-$$"

if run_in_sandbox "touch '$runtime_probe' 2>/dev/null"; then
  bad "Codex standalone runtime path is writable"
  rm -f "$runtime_probe" 2>/dev/null || true
else
  ok "Codex standalone runtime path is not writable"
fi

# --------------------------------------------------------------------
# 11. External shared libraries must be readable but not writable
# --------------------------------------------------------------------

external_repositories=(
  "../lib/corelib"
  "../lib/ui"
  "../leaonline-otulea"
)

for repo in "${external_repositories[@]}"; do
  if [[ ! -d "$repo" ]]; then
    warning "$repo does not exist on host"
    continue
  fi

  if run_in_sandbox "
    test -r '$repo' &&
    find '$repo' -mindepth 1 -maxdepth 1 -print -quit 2>/dev/null |
      grep -q .
  "; then
    ok "$repo is readable for source inspection"
  else
    bad "$repo is not readable through the configured Codex launcher"
  fi

  probe="$repo/.codex-external-write-test-$$"

  if run_in_sandbox "touch '$probe' 2>/dev/null"; then
    bad "$repo is writable; expected explicit read-only access"
    rm -f "$probe" 2>/dev/null || true
  else
    ok "$repo is not writable"
  fi
done

# --------------------------------------------------------------------
# 12. Network policy must be enabled
#
# First verify the committed policy. Then perform a best-effort runtime probe.
# A runtime connection failure is WARN rather than FAIL because host/firewall
# connectivity can fail independently of the Codex permission profile.
# --------------------------------------------------------------------

if [[ -r "$config" ]] &&
   awk '
     /^\[permissions\.leaonline-workspace\.network\]$/ { in_network=1; next }
     /^\[/ { in_network=0 }
     in_network && /^[[:space:]]*enabled[[:space:]]*=[[:space:]]*true[[:space:]]*$/ { found=1 }
     END { exit(found ? 0 : 1) }
   ' "$config"; then
  ok "network is enabled in leaonline-workspace permission profile"
else
  bad "network is not enabled in leaonline-workspace permission profile"
fi

if run_in_sandbox '
  timeout 4 bash -c "exec 3<>/dev/tcp/1.1.1.1/443" >/dev/null 2>&1
'; then
  ok "outbound TCP connection succeeds at runtime"
else
  warning "runtime network probe failed (policy may still be enabled; check host/firewall connectivity)"
fi

# --------------------------------------------------------------------
# 13. Workspace ancestors may be visible, but unrelated HOME contents
# must not be exposed.
# --------------------------------------------------------------------

home_entries="$(
  run_in_sandbox 'find "$HOME" -mindepth 1 -maxdepth 1 -printf "%f\n" 2>/dev/null' \
    2>/dev/null || true
)"

unexpected_home_entries=0

while IFS= read -r entry; do
  [[ -z "$entry" ]] && continue

  case "$WORKSPACE" in
    "$HOME/dev/"*|"$HOME/dev")
      [[ "$entry" == "dev" ]] && continue
      ;;
  esac

  # .codex can be synthetically exposed because its standalone runtime is
  # explicitly read-whitelisted.
  [[ "$entry" == ".codex" ]] && continue

  printf "${yellow}WARN${reset} unexpected HOME entry visible: %s\n" "$entry"
  unexpected_home_entries=$((unexpected_home_entries + 1))
  warn=$((warn + 1))
done <<< "$home_entries"

if [[ "$unexpected_home_entries" -eq 0 ]]; then
  ok "no unexpected top-level HOME contents are visible"
fi

# --------------------------------------------------------------------
# 14. Optional real multi-agent smoke test
#
# This verifies actual custom-role spawning, not just TOML/instruction presence.
# It deliberately asks both child agents to perform read-only work and expects
# exact markers in the root agent's final response.
# --------------------------------------------------------------------

if [[ "$AGENT_SMOKE" == "1" ]]; then
  printf '\nRunning live multi-agent smoke test (uses Codex model quota)...\n'

  smoke_output="$(mktemp)"
  smoke_err="$(mktemp)"

  smoke_prompt='This is a no-change multi-agent smoke test. Do not modify any file.
1. Spawn exactly one sub-agent with agent_type="implementer". Ask it only to read AGENTS.md and reply with the exact marker IMPLEMENTER_OK. Wait for it to finish.
2. Spawn exactly one fresh sub-agent with agent_type="reviewer". Ask it only to read DOMAIN.md and reply with the exact marker REVIEWER_OK. Wait for it to finish.
3. Do not perform implementation work and do not edit anything.
4. Your final response must contain both exact markers: IMPLEMENTER_OK REVIEWER_OK.'

  if run_codex exec --strict-config --json "$smoke_prompt" >"$smoke_output" 2>"$smoke_err"; then
    if grep -q 'IMPLEMENTER_OK' "$smoke_output" &&
       grep -q 'REVIEWER_OK' "$smoke_output"; then
      ok "live implementer/reviewer custom-agent smoke test succeeded"
    else
      bad "Codex exec completed but expected child-agent markers were not observed"
      printf '%s\n' '--- agent smoke stdout ---'
      tail -n 30 "$smoke_output"
      printf '%s\n' '--- agent smoke stderr ---'
      tail -n 30 "$smoke_err"
    fi
  else
    bad "live multi-agent smoke test failed"
    printf '%s\n' '--- agent smoke stderr ---'
    tail -n 50 "$smoke_err"
  fi

  rm -f "$smoke_output" "$smoke_err"
else
  warning "live multi-agent spawn test skipped (use --agent-smoke to enable)"
fi

# --------------------------------------------------------------------
# Codex skill cache must be readable but not writable
# --------------------------------------------------------------------

if run_in_sandbox '
  test -r "$HOME/.code/cache" &&
  find "$HOME/.code/cache" -mindepth 1 -maxdepth 1 -print -quit 2>/dev/null |
    grep -q .
'; then
  ok "~/.code/cache is readable"
else
  bad "~/.code/cache is not readable"
fi

skill_cache_probe="$HOME/.code/cache/.codex-write-test-$$"

if run_in_sandbox "touch '$skill_cache_probe' 2>/dev/null"; then
  bad "~/.code/cache is writable"
  rm -f "$skill_cache_probe" 2>/dev/null || true
else
  ok "~/.code/cache is read-only"
fi

# --------------------------------------------------------------------
# Summary
# --------------------------------------------------------------------

printf '\n----------------------------------------\n'
printf 'PASS: %d\n' "$pass"
printf 'WARN: %d\n' "$warn"
printf 'FAIL: %d\n' "$fail"
printf '%s\n' '----------------------------------------'

if [[ "$fail" -gt 0 ]]; then
  printf "${red}Security/agent configuration FAILED.${reset}\n"
  exit 1
fi

printf "${green}Security/agent configuration OK.${reset}\n"
exit 0
