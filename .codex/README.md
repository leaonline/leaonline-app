# Secure Codex setup for `leaonline-app`

This project is configured for Codex CLI **0.151.0** with a restricted filesystem permission
profile and optional multi-agent migration workflow.

## Security model

The committed `.codex/config.toml` keeps the application workspace as the only writable project
root. The launcher additionally exposes the shared package sources as read-only references.

Expected access:

| Location | Access |
| --- | --- |
| ordinary files in `leaonline-app` | read + write |
| `.deploy` target contents | no access |
| `.staging` target contents | no access |
| `~/.deployment` | no access |
| unrelated `$HOME` contents | no access |
| Codex standalone runtime | read-only |
| `../lib/corelib` | read-only |
| `../lib/ui` | read-only |
| network | controlled by the `leaonline-workspace` permission profile |

Always start Codex through:

```bash
./.codex/run-secure.sh
```

The launcher resolves `../lib/corelib` and `../lib/ui` to absolute paths and adds them as
read-only filesystem exceptions. They are deliberately **not** added to `:workspace_roots`.

## Normal Codex session

A normal session uses the same project security configuration but does not need to spawn
sub-agents.

Start an interactive session with:

```bash
./.codex/run-secure.sh
```

Then use Codex normally, for example:

```text
Inspect the current implementation of the login flow and explain how authentication state is
propagated from the Meteor server to the client. Do not modify any files and do not spawn
sub-agents.
```

For a one-shot non-interactive task:

```bash
./.codex/run-secure.sh exec \
  "Inspect the current implementation of the login flow and explain how authentication state is propagated from the Meteor server to the client. Do not modify files or spawn sub-agents."
```

### Selecting reasoning effort per session

Reasoning effort is intentionally not pinned in the committed configuration. Override it only
for the session that needs it:

```bash
./.codex/run-secure.sh \
  -c model_reasoning_effort=high
```

or for a non-interactive run:

```bash
./.codex/run-secure.sh exec \
  -c model_reasoning_effort=high \
  "Review the current migration state and identify the highest-risk unresolved issue."
```

## Multi-agent migration session

There is no separate Codex CLI command for an "agent session". Start the same root Codex session
through `run-secure.sh`, then explicitly instruct that root agent to act as the orchestrator and
use the configured agent roles.

The project defines:

- `implementer` — performs migration changes and validation;
- `reviewer` — independently reviews the result and is instructed to remain read-only.

Both native sub-agents inherit the root session's filesystem/network permission profile in
Codex CLI 0.151.0. The role files define responsibilities and behavior; they are not separate
filesystem sandboxes.

For migration work, high reasoning is recommended at the root session level:

```bash
./.codex/run-secure.sh \
  -c model_reasoning_effort=high
```

Then provide a migration prompt such as:

```text
Implement the staged migration plan in docs/MIGRATION.md.

Act as the parent/orchestrator and follow the multi-agent workflow defined in AGENTS.md.

Requirements:

1. Read AGENTS.md, DOMAIN.md, docs/MIGRATION.md, relevant source code, and tests before changing
   anything.
2. Check the current branch and working-tree state before implementation.
3. Spawn exactly one sub-agent using agent_type="implementer".
4. Have the implementer execute the migration stages in their defined order and run the relevant
   validation after each stage.
5. The implementer may inspect ../lib/corelib and ../lib/ui when shared-package implementation
   details are needed, but those repositories are reference-only and must not be modified.
6. After implementation and validation are complete, spawn a fresh sub-agent using
   agent_type="reviewer".
7. The reviewer must independently inspect the migration plan, resulting diff, relevant source,
   tests, DOMAIN.md, and the shared-library sources where necessary. It must not modify files.
8. Evaluate the review findings. Delegate justified corrections back to an implementer.
9. Re-run the relevant validation after corrections.
10. If the corrections are substantial, run one final reviewer pass.
11. Do not deploy, publish, push, modify .deploy/.staging, modify credentials, perform destructive
    Git operations, or bypass denied permissions.
12. If an operation is denied by the permission profile, record it as a manual follow-up and
    continue with all other safe work.

At completion report:
- migration stages completed;
- material files/components changed;
- tests, linting, and builds executed and their results;
- reviewer findings and their resolution;
- unresolved or manual follow-up steps.
```

The important difference from a normal session is therefore the **orchestration instruction**,
not a different launcher or permission profile.

## Unattended multi-agent run

For a non-interactive run, pass the orchestration prompt to `codex exec`. For longer work, run
that command inside `tmux` so the process survives terminal disconnection.

Example:

```bash
tmux new-session -s lea-migration
```

Inside the `tmux` session:

```bash
./.codex/run-secure.sh exec \
  -c model_reasoning_effort=high \
  "$(cat migration-prompt.txt)"
```

Detach with:

```text
Ctrl-b d
```

Reattach later with:

```bash
tmux attach -t lea-migration
```

A practical approach is to store the orchestration prompt shown above in an untracked
`migration-prompt.txt` file and pass it to `codex exec`.

## Validate the setup first

Run the security/configuration test before starting migration work:

```bash
./test.sh /home/user/path/to/leaonline/leaonline-app
```

To additionally verify that Codex can spawn the configured `implementer` and `reviewer` roles:

```bash
./test.sh --agent-smoke /home/user/path/to/leaonline/leaonline-app
```

The smoke test consumes Codex model usage, so it is intentionally opt-in.

## Important limitations

### Reviewer isolation

The `reviewer` role is behaviorally read-only. In Codex CLI 0.151.0, native sub-agents inherit
the parent permission profile, so the reviewer is not protected by a separate OS-level
read-only sandbox.

The reviewer instructions therefore explicitly prohibit edits. If hard filesystem enforcement
for the reviewer is required, run the review as a separate Codex process under a dedicated
read-only permission profile instead of using it as a native sub-agent.

### External shared packages

`../lib/corelib` and `../lib/ui` are exposed only so agents can inspect implementation details
of `leaonline:corelib` and `leaonline:ui`.

They must not be treated as part of the `leaonline-app` migration workspace. Changes to those
repositories require a separate task and permission decision.
