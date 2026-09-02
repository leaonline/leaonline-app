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

## External Reference Repositories

The following independent repositories are available outside the
`leaonline-app` workspace as read-only reference sources:

- `../lib/corelib` - source of `leaonline:corelib`
- `../lib/ui` - source of `leaonline:ui`
- `../leaonline-otulea` - source of the `otu.lea` application

Agents may inspect and search these repositories to understand:

- shared APIs and implementation details;
- domain models and data structures;
- established usage patterns for `leaonline:corelib` and `leaonline:ui`;
- equivalent or related functionality already implemented in `otu.lea`;
- architectural conventions that may be relevant to the migration.

These repositories are not part of the writable `leaonline-app` workspace.

Agents must not:

- modify files in these repositories;
- stage, commit, reset, clean, or otherwise alter their Git state;
- copy implementations wholesale when existing shared functionality can be reused;
- treat them as migration targets unless a separate task explicitly changes their scope.

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

## Legacy Documentation and Evidence

The material under `docs/api`, `docs/arch`, and `docs/guide` documents the deprecated mobile
client and its original Meteor backend. Use it together with `deprecated/app` to understand the
learner experience and the historical division of responsibilities; do not treat it as a
specification of the current source tree.

Interpret legacy evidence in this order:

1. User-visible workflow and domain intent shown consistently by diagrams, guides, API docs,
   deprecated source, and tests are migration-parity evidence.
2. Generated API pages are snapshots of old code. They are useful for method payloads, state
   transitions, and component responsibilities, but their code is not automatically safe or
   current.
3. Guide text marked `TBD`, incomplete test scenarios, comments describing future work, and
   contradictory statements are historical design notes, not requirements.
4. Known defects and incidental React Native/Expo mechanisms are not parity requirements. Preserve
   the user-observable outcome, not a broken selector, stale field name, mutable cache, mobile
   lifecycle workaround, or framework-specific component tree.
5. Current `src` backend contracts and persisted data may already differ because migration work has
   begun. Inspect current code and compatibility requirements before changing them; never overwrite
   a newer server design merely to match generated legacy docs.

When sources conflict, follow this authority order:

1. explicit user instructions, this file, and [DOMAIN.md](./DOMAIN.md);
2. the approved migration plan and recorded product decisions;
3. consistent deprecated-mobile learner behavior and tests;
4. shared `leaonline:corelib` and `leaonline:ui` contracts;
5. legacy backend/API documentation for historical intent;
6. persisted/current implementation details for compatibility evidence.

Record material conflicts instead of silently choosing an interpretation. In particular, do not
infer a product rule from a single stale guide sentence when code, tests, or content support a
broader case.

## Architecture and Workflow Boundaries

The mobile system used three distinct data/runtime layers:

- `lea.content` was the upstream editorial content authority.
- The Meteor backend imported explicitly enabled full collections during startup, retained the
  production-approved snapshot, precomputed read-optimized map and achievement data, and owned
  accounts, sessions, responses, scoring-derived progress, and client-facing methods.
- The mobile client synchronized a bounded set of rarely changing reference contexts into local
  storage and combined that topology/reference data with account-specific server state. It was not
  an independent content authority.

Keep the equivalent PWA boundaries explicit:

- server/content synchronization and remapping remain server responsibilities and are required
  parts of the web application architecture, not temporary legacy compatibility;
- the browser may cache versioned content for performance/offline use but must not import from the
  content service, generate canonical map topology, or decide authoritative progress;
- static topology/reference caches must be separated from account-scoped session, response, and
  progress data;
- a local response cache or future outbox is provisional until durable server acknowledgement;
- server methods derive identity from the authenticated invocation and verify ownership and content
  relationships rather than trusting client-supplied identifiers or scores.

### Controlled Learning-Content Promotion

The active web application must never expose live `lea.content` data directly to learners. Editors
and developers need to create, revise, and test Fields, UnitSets, Units, Items, media, and related
metadata without unfinished or inconsistent work appearing in production lea.app.

Preserve the backend snapshot boundary:

- `lea.content` is the editorial source, while the lea.app backend's local collections are the
  learner-facing production snapshot;
- synchronization is an explicit, configured startup operation for selected full collections; a
  content edit alone must not change what learners see;
- normal client methods/publications read the backend snapshot and must not proxy learner requests
  to live content-service collections;
- disabled synchronization leaves the approved backend snapshot unchanged;
- a failed or partial import must not become the active learner-facing state. Validate required
  relationships and complete all derived remap/achievement work before marking the new snapshot
  ready;
- map topology, achievement maxima, sync hashes/versions, and other content-derived read models must
  correspond to the same imported snapshot and be refreshed only as part of its controlled
  promotion;
- preserve the last known-good snapshot and report synchronization/remap failures. Do not clear
  production collections first or silently continue with a mixed old/new content graph;
- changes to synchronization selection, activation, validation, or promotion behavior are
  production-content release changes and require explicit tests and operational documentation.

Do not replace this boundary with live publications, direct browser-to-content-service access,
request-time content fetching, or automatic continuous synchronization during the PWA migration.

The historical learner path is: restore an existing login token or enter the registration/recovery
flow; accept legal terms during registration; choose a field; view the field journey map; choose a
stage and then a dimension/unit set; view the unit-set story once at its beginning when present;
complete ordered unit pages with immediate feedback; complete the unit set; return to refreshed map
progress; optionally use profile, achievements, TTS settings, account recovery, or deletion.

Preserve these behavioral boundaries while translating them to web navigation:

- authentication gates the learning routes, but connectivity state is independently visible;
- field, stage, dimension, unit-set, unit, and page selection are distinct states and must not be
  collapsed merely because a web route can encode them in one URL;
- a session is server-owned resumable learning state for one user and unit set; browser route/cache
  state is only a projection;
- unit-set story state is distinct from the first unit/page and is shown only at the start of a new
  applicable session, not on every resume;
- pages may contain zero, one, or multiple content elements/items. Empty pages remain navigable, and
  response/scoring logic must key multiple items independently;
- evaluation feedback precedes advancement. A failed durable submission must not be presented as
  authoritative completion;
- completion updates progress before the map/achievement projection is treated as refreshed;
- TTS, plain language, large controls, non-color feedback, and predictable back/continue behavior
  are core accessibility behavior, not decorative mobile details;
- internet reachability, backend/DDP reachability, authentication restoration, reference-data sync,
  and learner-data submission are separate states with separate recovery messages.

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
- Follow [docs/guide/CONTRIBUTIONS.md](./docs/guide/CONTRIBUTIONS.md). Treat its React Native,
  Expo, and Jest details as legacy where they conflict with the active Meteor PWA toolchain.
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
