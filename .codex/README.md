# Secure Codex migration setup (CLI 0.151.0)

Use:

```bash
./.codex/run-secure.sh
```

or, for a prompt:

```bash
./.codex/run-secure.sh "Implement the staged migration plan using the configured implementer and reviewer roles."
```

The launcher resolves `../lib/corelib` and `../lib/ui` to absolute paths and adds them as
read-only filesystem exceptions. They are not added to `:workspace_roots`.

Important: Codex CLI 0.151.0 does not apply filesystem/sandbox settings from custom agent role
files. Native sub-agents inherit the parent permission profile. The reviewer role is therefore
behaviorally read-only. For an OS-enforced read-only reviewer, run review as a separate Codex
process under a separate permission profile.
