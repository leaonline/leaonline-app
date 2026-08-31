# Agent Instructions

## Project: leaonline-app

`lea.app` is an anonymous learning application for adults with low literacy. It targets
domain-specific learning contexts such as nursing, technical occupations, food industry,
financial literacy, and general learning tasks in reading, writing, language, and mathematics.

Before planning, implementing, reviewing, or testing changes, read [DOMAIN.md](./DOMAIN.md).
Treat it as authoritative project-specific domain knowledge unless it conflicts with this file
or an explicit user instruction.

## Migration Context

The application was originally implemented as a React Native client backed by Meteor.
It is being migrated to a Meteor-based Progressive Web App (PWA).

The migration is intentionally staged. When a migration plan is provided in the task, treat
that plan as the source of truth for scope, ordering, acceptance criteria, and completion.
Do not silently reorder, merge, skip, or broaden migration stages unless required to preserve
correctness. If a deviation is necessary, document it clearly.

Relevant shared packages include:

- `leaonline:corelib`
- `leaonline:ui`

Prefer existing shared definitions and functionality over introducing app-local duplicates.

The source repositories for these packages are located outside the application workspace:

- `../lib/corelib` - source for `leaonline:corelib`
- `../lib/ui` - source for `leaonline:ui`

They are external, independent Git repositories and are not part of the leaonline-app workspace.
The Codex launcher grants them explicit read-only filesystem access for source inspection. Agents
may inspect and search them to understand APIs, data models, implementation details, and expected
behavior, but must not modify, commit, reset, clean, or otherwise operate on their Git trees.

## Repository Layout

- `.deploy` - deployment configuration. **Never modify, replace, delete, or follow writable
  symlink targets outside the workspace.**
- `.staging` - deployment configuration. **Never modify, replace, delete, or follow writable
  symlink targets outside the workspace.**
- `.github` - GitHub-specific configuration and documentation; may contain an `agents/`
  directory with task- or role-specific guidance.
- `deprecated` - deprecated mobile application code used as a migration source.
- `docs` - project and API documentation.
- `src` - active Meteor application.

The active Meteor application follows the common Meteor project structure:
https://docs.meteor.com/tutorials/application-structure/#file-structure

## General Engineering Rules

- Write only within the configured application workspace and only to files relevant to the task.
- Read access to explicitly permitted external shared-library repositories is allowed for reference.
- Preserve existing behavior unless the migration plan explicitly changes it.
- Prefer small, traceable changes over broad rewrites.
- Do not introduce duplicate domain models when equivalent definitions already exist in
  shared packages.
- Inspect surrounding code and tests before changing public interfaces.
- Keep migration compatibility explicit where old and new implementations coexist.
- Do not modify secrets, credentials, deployment infrastructure, or production data.
- Do not deploy, publish releases/packages, or push remote changes unless explicitly asked.
- Do not perform destructive Git operations such as `reset --hard`, force pushes, history
  rewrites, or deletion of unrelated work.
- Never modify `.deploy` or `.staging`.

## Multi-Agent Migration Workflow

For implementation of a staged migration plan, the parent agent acts as orchestrator and may
spawn sub-agents. Sub-agents must be told that they share the same repository and must not
revert or overwrite unrelated work.

Use this workflow unless the user explicitly requests another one:

1. Read `AGENTS.md`, `DOMAIN.md`, the migration plan, relevant source code, and tests.
2. Establish the current branch, working-tree state, and migration stage being implemented.
3. Spawn exactly one `implementer` agent using the configured `implementer` agent role.
4. After implementation and validation, spawn a fresh `reviewer` agent using the configured
   `reviewer` agent role.
5. Evaluate the review findings.
6. Apply justified corrections through the `implementer` role (or directly only when the change
   is trivial and clearly within the parent agent's responsibility).
7. Re-run relevant validation.
8. If corrections were substantial, spawn a fresh `reviewer` for one final review pass.
9. Report completed stages, validation results, review findings, and unresolved/manual steps.

Codex CLI 0.151.0 applies the parent session's filesystem/network permission profile to spawned
sub-agents. The role files configure behavior and role-specific instructions; they do not create
independent filesystem sandboxes. Therefore, the project's custom permission profile remains the
single enforced security boundary for the parent and all native sub-agents.

The reviewer is behaviorally read-only: never ask it to edit files. If hard OS-level read-only
enforcement is required for review, run the review as a separate Codex process under a separate
permission profile rather than as a native sub-agent.

Do not run implementation and review agents as concurrent writers to the same working tree.

### Configured Agent Roles

The project defines separate Codex roles under `.codex/agents/`:

- `implementer` - implementation and validation behavior.
- `reviewer` - independent review behavior; it must not modify files.

Both roles inherit the parent session's enforced permission profile in Codex CLI 0.151.0. The
role distinction must therefore not be treated as a filesystem-security boundary.

Always pass the intended role when spawning a migration sub-agent. Do not spawn an untyped/default
sub-agent for implementation or review when these roles are available.

If the `reviewer` finds a defect, it reports the defect and proposed change to the parent; the
parent delegates any resulting modification back to an `implementer`.

### Implementation Agent

The implementation agent may:

- inspect and edit files inside the configured workspace;
- implement the migration plan stage by stage;
- run non-destructive local development commands;
- run linting, tests, type checks, builds, formatting checks, and equivalent validation;
- add or update tests needed to validate migrated behavior.

The implementation agent must:

- follow the migration stages in their defined order unless a dependency requires otherwise;
- validate each stage before moving to the next;
- preserve domain semantics defined in `DOMAIN.md`;
- reuse `leaonline:corelib` and `leaonline:ui` where appropriate;
- avoid unrelated refactoring;
- record blockers or operations that require unavailable permissions rather than stalling the
  entire migration.

The implementation agent must not:

- deploy;
- push to remotes;
- publish packages or releases;
- modify production services or databases;
- modify `.deploy` or `.staging`;
- perform destructive Git operations;
- alter credentials or secrets;
- write outside the configured workspace.

### Review Agent

The review agent is independent from the implementation reasoning. It must inspect:

- the migration plan;
- `AGENTS.md`;
- `DOMAIN.md`;
- the resulting diff;
- relevant surrounding implementation;
- relevant tests and validation results.

The reviewer must not modify files.

Review for, at minimum:

- incomplete or skipped migration steps;
- behavioral regressions;
- incorrect domain assumptions;
- misuse or duplication of shared library functionality;
- architecture violations;
- missing or weak tests;
- compatibility issues between deprecated and migrated code;
- unsafe data transformations;
- incorrect Meteor/client/server boundaries;
- unnecessary scope expansion.

Report findings by severity and include concrete proposed changes. Distinguish confirmed defects
from risks or optional improvements.

## Environment and Validation

### Setup

Use the repository's existing setup and package-management conventions. Do not introduce a new
toolchain unless the migration plan requires it.

### Linting

Use npm scripts defined in `src/package.json`.

### Tests

Use `test.sh` with appropriate parameters.

### Building

Use the existing Meteor/npm build scripts defined by the project. Prefer validation commands
already used by the repository over ad-hoc alternatives.

## Git and Commits

- Never commit directly on `main` or `master`.
- Work on a separate task-specific branch.
- Follow `CONTRIBUTING.md`.
- Include issue numbers in commit messages when applicable.
- If commits are explicitly requested, append the agent name in brackets at the end of the
  commit message.
- Example: `fix: user authentication issue (#123) [codex]`
- Do not create commits merely because work is complete unless the user or task explicitly
  requests commits.

## Unattended Execution

Routine non-destructive work that is permitted by the configured sandbox should proceed without
asking the user for confirmation.

If an action is destructive, external, outside the configured workspace, or otherwise requires
approval that is not automatically granted:

1. do not circumvent the permission boundary;
2. skip that action;
3. record it as an unresolved/manual step;
4. continue all other safe work that can still be completed.

Do not block the entire unattended migration on an optional approval.
