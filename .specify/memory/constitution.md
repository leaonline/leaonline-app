# lea.app — Project Constitution (Spec Kit)

> This file is the Spec Kit constitution for the lea.app mobile-to-Blaze PWA migration.
> It holds the **non-negotiable principles** that every spec, plan, and task must respect.
> It is deliberately short — detail lives in the referenced authoritative files.

## Authoritative references (read these before specifying/planning)

- [`AGENTS.md`](../../AGENTS.md) — Codex project instructions: repo layout, reference
  repositories, multi-agent workflow, engineering rules, validation commands. **Codex loads
  this on every run; do not duplicate it here.**
- [`DOMAIN.md`](../../DOMAIN.md) — domain definitions, invariants, and terminology.
  Treat as authoritative project-specific domain knowledge.
- `docs/plans/01_mobile-to-blaze-pwa-migration.md` — the approved migration plan. This is the
  **master migration charter**: scope, ordering, acceptance criteria, and phase gates.
  It is the source of truth for *what* to migrate and *in what order*.
- Pinned Meteor 3.4 API: <https://release-3-4-0.docs-online.meteor.com/api/>

## Non-negotiable principles

1. **Capability-first on Meteor 3.4.** Before designing any infrastructure, check the pinned
   Meteor 3.4 API and maintained packages. A custom abstraction is justified only when it
   implements a lea.app domain semantic, fills a documented Meteor gap, or wraps a Meteor
   API in a thin testable boundary. Record the reason for every retained custom mechanism.

2. **No platform swap.** Stay on Meteor 3.4 + Blaze + the Meteor bundler. Do not introduce
   TypeScript, React, another frontend, or a new state-management architecture. Rspack
   conversion is a later, separate project. No alpha/beta/RC dependencies beyond inherited debt.

3. **Three-layer authority model is sacred.** `lea.content` (editorial) → backend startup-sync
   snapshot (learner-facing production content) → browser cache (projection only). Learners
   never read live `lea.content`. Synchronization is an explicit, configured, gated promotion —
   not a transport optimization. A failed/partial import must never become learner-visible state.

4. **Anonymous but authenticated.** Every learner has an internal Meteor account; all server
   operations derive `userId` from the invocation. Use `accounts-base`/`accounts-password`,
   `Accounts.createUserAsync`, resume tokens. Never create a parallel auth/token/session
   protocol, never read/write `services.resume` directly, never publish the `services` object.

5. **Server is authoritative; client is projection.** The server owns identity, session
   transitions, response persistence, scoring/progress, content exposure, and final completion.
   Client scoring is formative feedback only — never authority to invent or alter persisted
   competency achievement. A failed durable submission must not be presented as completion.

6. **Domain distinctions must not collapse.** Scoring ≠ Evaluation ≠ Progress. Response states
   (entered / absent / null / `__undefined__`) are semantically distinct. A UnitSet repeat
   supersedes — never adds to — the effective performance. Do not infer competency achievement
   from absence of data unless an explicit domain rule does so.

7. **lea.app is a learning product, not a diagnostic tool.** Map, feedback, completion, and
   achievements motivate learners. otu.lea's diagnostic workflow, supervised users, test-cycle
   evaluation, records, printing, and teacher-facing details must not leak into lea.app. Reuse
   otu.lea Blaze patterns only — never diagnostic semantics.

8. **Small, traceable, independently reviewable changes.** One Spec Kit feature per branch.
   Never mix package upgrades, data migrations, server contracts, and visual redesign in one
   change set. Follow the migration plan's phase ordering; document any deviation.

9. **Validation before advancement.** Each phase ends with a typed gate (automated / reviewer /
   product / operational). Automated and reviewer gates are hard gates. Do not claim a dependent
   release criterion is complete; report it as `ready_for_product_approval` or
   `ready_for_operational_validation` instead.

10. **Accessibility is core behavior, not decoration.** TTS, plain language, large predictable
    controls, keyboard/touch access, visible focus, and feedback that does not rely solely on
    color/animation/sound are part of the learning behavior for this audience.

## Source-of-truth hierarchy (when implementations disagree)

1. `AGENTS.md`, `DOMAIN.md`, confirmed product requirements, approved product decisions.
2. The approved migration plan's explicit contracts.
3. Consistent deprecated-mobile learner workflow, source, and tests.
4. Shared `leaonline:corelib` and `leaonline:ui` domain/renderer contracts.
5. Current persisted data and supported backend contracts for migration compatibility.
6. Current implementation and generated legacy API docs as evidence, not automatic authority.
7. otu.lea for Blaze integration patterns and immediate-feedback mechanics only.

## Out of scope for this migration

- Extended authentication (passwordless email, QR, OAuth, account merge): `02_extended-authentication.md`
- Full offline learning, response outbox/replay, content cache lifecycle: `03_offline-and-client-data-management.md`
- Modifying `.deploy` / `.staging`, or the read-only reference repos (`../lib/corelib`,
  `../lib/ui`, `../leaonline-otulea`).
