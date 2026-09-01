# Review for lea.app mobile-to-Blaze PWA migration plan

To continue this session, run codex resume, then select Review migration implementation plan (01a0582c-35a5-77e2-bd85-2bb05ca248fc)

## Confirmed plan conflicts

1. The authentication redesign has no implementation phase.

Sections 4.3.1–4.3.5 mandate code, passwordless, QR, recovery migration, and token revocation
(docs/plans/mobile-to-blaze-pwa-migration.md:198). The definition of completion requires them
(docs/plans/mobile-to-blaze-pwa-migration.md:898), but Phases 1–7 never implement them.

This is also a product change, not straightforward mobile parity. The mobile app creates an
anonymous account and relies on a resume token plus restore code (deprecated/app/lib/hooks/
useLogin.js:150); it does not establish the proposed human-readable routine “code mode.”
Current web email login can create an entirely separate user (src/contexts/users/
Users.js:276), while Google login is currently enabled (src/ui/pages/welcome/welcome.js:37)
but absent from the target mode list.

Suggested improvement: either:

- move the gradual-authentication redesign to a separate approved plan and preserve mobile
  registration/recovery semantics here; or

- add a dedicated authentication phase covering schema migration, all setup/login/recovery
  methods, Google/OAuth disposition, account settings, privacy copy, legacy migration, and E2E
  tests.

2. Response and progress semantics are not concrete enough for Phase 2.

The plan requests a canonical DTO and an idempotency key containing attempt-policy (docs/
plans/mobile-to-blaze-pwa-migration.md:678), but that policy is still unresolved. More
importantly, it does not define:

- the exact wire and persisted representations of entered, absent, null, empty, and
  __undefined__;

- the raw-response union required by choice, cloze, highlight, and connect;
- whether an attempt is a separate document or a revision of one logical response;
- what progress counts—pages, completed units, item attempts, or achievement;
- whether competency progress counts unique competencies or repeated fulfilled associations.

This matters because DOMAIN.md requires the four response states to remain distinct
(DOMAIN.md:114), while shared scoring intentionally treats several empty forms equivalently at
its scoring boundary. Persistence must preserve the states even when scoring normalizes them.

Suggested improvement: add a Phase 0 contract appendix containing:

- versioned request/response DTOs;
- a response-state truth table from renderer → cache → method → Mongo → scoring;
- attempt identity and retry rules;
- progress and competency aggregation formulas;
- exact method success DTOs and stable Meteor.Error codes.

The server should normally derive userId, unitSetId, dimensionId, and itemType from the
authenticated session and canonical content rather than trusting client copies.

3. Server scoring is required before its shared adapter exists.

Phase 2 gates on correct server scoring, while Phase 4 introduces the canonical feedback/
scoring adapter. That can lead to two implementations and a reviewer correctly rejecting
duplication.

Suggested improvement: create the framework-neutral response normalization and canonical
scoring adapter in Phase 2. Phase 4 should integrate that same module with Blaze/renderers and
accessible feedback.

4. Human approval gates conflict with unattended sequential implementation.

The plan says later phases must not start until each gate passes (docs/plans/mobile-to-blaze-
pwa-migration.md:633). Phase 0 requires product-owner approval, Phase 3B requires side-by-side
product review, and Phase 7 requires a staged pilot. An agent cannot satisfy those gates
independently, while AGENTS.md requires stages to remain ordered.

Suggested improvement: label each gate as:

- automated;
- reviewer-approved;
- human/product-approved; or
- operational/manual.

Also define whether a human gate is a hard stop or whether later work may proceed
provisionally. The parent agent should report ready_for_product_approval; a reviewer should
not report missing human approval as a code defect.

5. The map’s persistence instructions contradict each other.

The plan requires exactly one map per field (docs/plans/mobile-to-blaze-pwa-migration.md:376),
but later says to write a new version before making it current (docs/plans/mobile-to-blaze-
pwa-migration.md:572). The latter suggests staged documents plus an active pointer.

I would resolve this without another architectural decision: build and validate the entire
topology in memory, then atomically replace/upsert the single field document. Add
schemaVersion, topologyVersion or content hash, and generatedAt. Mongo’s single-document
replacement prevents partial reads. If historical/staged map documents are desired instead,
the “exactly one map” invariant and index design must change explicitly.

Also define the stable ID formula and split cache keys:

- topology: field + topology version + schema version;
- learner state: account + field + learner-state version;
- derived geometry: topology version + width class.

6. “Session-start method” is undefined.

The plan requires availability enforcement in a session-start method, but current
Session.methods.get is a get-or-create mutation (src/contexts/session/Session.js:265).
Elsewhere the current UI refers to a nonexistent Session.methods.next.

Suggested improvement: define one explicit API, for example:

- session.start({ fieldId, unitSetId, topologyVersion });
- session.resume({ sessionId });
- session.advance({ sessionId, expectedUnitId, transitionId });
- session.restart({ sessionId }).

Document ownership, availability, idempotency, and exact return DTOs for each. Preserve old
method names only through an explicitly tested compatibility wrapper.

7. Mobile compatibility is underspecified at the most difficult boundary.

The mobile client submits client-produced score structures, whereas the new contract intends
to accept raw responses and score server-side. “Accept both payloads temporarily” does not say
how the server securely interprets legacy scores or distinguishes protocol versions.

Suggested improvement: after deciding mobile EOL timing, specify either:

- a new versioned method name for the web client while the legacy method remains frozen; or
- an explicit tagged union DTO with server-side reconstruction and verification of legacy
  values.

Include indexes, data backfill, rollback, duplicate handling, and removal criteria.
“Releasable after every phase” should mean behaviorally safe and backward compatible, not
necessarily independently deployable.

8. The test gate cannot currently be executed as written.

The actual runner is src/test.sh:1, not a root-level script. It defaults to server tests and
exposes no client-test option (src/test.sh:13). src/package.json has no test scripts (src/
package.json:4), and the repository has no existing browser E2E or visual-regression
framework.

Suggested Phase 1 details:

- add test:server, test:client, and test:all scripts;
- extend src/test.sh with explicit server/client flags;
- define the browser driver and a positive “browser connected” assertion;
- select and authorize an E2E framework;
- define where visual baselines live and how changes are approved;
- supply numerical map performance budgets and the emulated/reference device;
- clarify that “do not mock Mongo” applies to server contract tests, not every existing unit
  test.

9. Phase scope overlaps create reviewer ambiguity.

Phase 3B fully implements locked/current map semantics, but Phase 5 again says to align those
semantics (docs/plans/mobile-to-blaze-pwa-migration.md:769). Phase 7 repeats accessibility
already required by earlier gates.

Suggested improvement:

- rename Phase 3B to Phase 4 or Phase 3.1;
- make the map phase authoritative for map semantics;
- make the later workflow phase perform integration/regression only;
- describe Phase 7 as a whole-application audit, not deferred accessibility implementation.

10. Supported renderer scope is ambiguous.

The deprecated app confirms choice, cloze, highlight, and connect. Shared leaonline:ui also
contains a sort renderer. “Every supported item subtype” could therefore produce opposite
review conclusions.

Suggested improvement: have Phase 0 produce an explicit matrix with required, unsupported, and
deferred entries. Based on the stated parity objective, the inferred default is the four
mobile types; sort becomes required only if the approved content inventory contains it.

11. The otu.lea reference is unavailable to agents under the documented permission profile.

The plan requires using otu.lea’s internal feedback path, but AGENTS.md grants external read
access only to corelib and ui (AGENTS.md:30). An implementer may be unable to inspect the
referenced otu.lea files.

Suggested improvement: either grant that repository read-only access, copy a frozen non-
product-specific reference/contract into this workspace, or remove otu.lea inspection as an
implementation requirement.

12. Source-of-truth wording should distinguish semantics from compatibility.

The plan ranks current persisted contracts above shared packages even though it lists current
contracts as defective. A reviewer could use that ordering to defend broken local schemas over
shared renderer payloads.

Suggested hierarchy:

1. AGENTS.md, DOMAIN.md, approved product decisions;
2. approved migration-plan contracts;
3. deprecated mobile learner behavior;
4. shared corelib/ui domain and renderer contracts;
5. persisted data solely for migration/backward compatibility;
6. current implementation as evidence, not authority;
7. otu.lea integration patterns.

The root README.md:9 is also outdated and still describes a React Native mobile app. Add its
update to release documentation so future agents do not receive conflicting context. Likewise,
infer docs/guide/CONTRIBUTIONS.md wherever AGENTS.md says nonexistent CONTRIBUTING.md.

## Decisions that require your guidance

The existing twelve open decisions are genuinely blocking. In addition, I need these decisions
recorded before implementation:

1. Is the gradual code/passwordless/QR design part of this migration, or a separate
   authentication project?

2. If it remains here, should Google/OAuth be removed, retained as another primary mode, or
   restricted to development?

3. What exactly is one unit of progress, and are achieved competencies counted uniquely or per
   scored occurrence?

4. Is an item retry stored as a new immutable attempt or as a replacement, and which attempt
   affects longitudinal progress?

5. Are human/product gates hard stops, or may later phases proceed provisionally?
6. Which E2E framework is authorized, and what numerical performance/device budgets should
   gate the map?

7. May agents receive read-only access to otu.lea, or should the plan rely only on local/
   shared sources?

8. What happens when an email being attached to an anonymous account already belongs to
   another account: reject, recover the existing account, or support an explicit merge?

9. Is sort a release-supported item type, or are the four mobile item types the complete
   parity target?

10. Should a remap retain historical topology versions, or is atomic replacement of one
    document per field sufficient?

Once those are answered, the plan should be revised before implementation so the implementer
and reviewer evaluate the same concrete contracts and gate states.
