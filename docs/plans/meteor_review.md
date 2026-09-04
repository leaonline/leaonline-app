The documents have a solid Meteor 3.4 foundation, and DOMAIN.md is internally coherent. I found three confirmed
technical misunderstandings and five material ambiguities that should be resolved before the main migration plan can
truthfully claim there are “no remaining review decisions.”

The repository is correctly pinned to METEOR@3.4; the relevant installed packages include Accounts, Blaze, Mongo,
dynamic-import, autoupdate, audit-argument-checks, and ddp-rate-limiter.

## Confirmed misunderstandings

### 1. Content promotion cannot satisfy its atomicity guarantee as designed

The plan requires content collections, map data, achievement maxima, and client versions to become visible as one
promotion (docs/plans/01_mobile-to-blaze-pwa-migration.md:286). But the map design simultaneously:

- replaces each field document independently;
- keeps no historical topology;
- introduces no active-version pointer (docs/plans/01_mobile-to-blaze-pwa-migration.md:634).

A single-document Mongo replacement is atomic only for that document. It cannot atomically promote multiple content
collections and derived documents. Meteor startup sequencing does not add that guarantee; AGENTS.md correctly says this
remains application-specific (AGENTS.md:182).

The plan must choose a concrete strategy in Phase 0, such as:

- versioned/staging collections plus one atomic active-snapshot pointer;
- snapshot IDs on every learner-facing document with reads pinned to one active ID;
- or a Mongo transaction, after documenting replica-set requirements and transaction scope.

“In-memory validation followed by per-document upserts” is insufficient. This also conflicts with the instruction that
no active-version pointer be introduced.

### 2. Accounts.sendLoginTokenEmail is described as avoiding custom token persistence

The authentication plan groups Accounts.sendLoginTokenEmail with the normal passwordless workflow while forbidding
custom token documents (docs/plans/02_extended-authentication.md:58).

Meteor documents Accounts.sendLoginTokenEmail as a low-level/manual API: callers must create the token/sequence and save
it themselves. The normal managed flow is Accounts.requestLoginTokenForUser, followed by
Meteor.passwordlessLoginWithToken. See the official accounts-passwordless documentation.

Recommended correction: remove Accounts.sendLoginTokenEmail from the standard design. Retain it only as an explicitly
rejected/manual alternative unless the project deliberately accepts ownership of token generation and persistence.

### 3. autoupdate does not inherently provide an active-work-safe update flow

Both AGENTS.md and the plans refer broadly to “autoupdate/WebApp update hooks” as owning bundle-update signaling (
AGENTS.md:179; docs/plans/01_mobile-to-blaze-pwa-migration.md:983).

Meteor’s browser autoupdate behavior normally hard-reloads the page when the client bundle changes.
WebApp.addUpdatedNotifyHook is server-only and normally concerned with runtime configuration changes; it is not a
client-side “safe to
activate” controller. The official autoupdate documentation explicitly describes forced browser reload behavior.

The plan needs to name the supported interception/control point and verify it exists in the pinned package versions. If
this requires reload migration hooks or an app-specific wrapper, that dependency and its public/private API status
must be stated. Service-worker activation and Meteor HCP also need a single named coordinator to prevent competing
reloads.

## Material ambiguities

### 4. The session API cannot enforce page-based progress as written

The contract declares one progress unit per completed page (docs/plans/01_mobile-to-blaze-pwa-migration.md:689), but the
only transition method is:

session.advance({ sessionId, expectedUnitId, transitionId })

It contains no page identifier, expected page, accepted-response set, or content/snapshot version. The next paragraph
then says progress is represented by completed Units and resume begins after the last completed Unit (docs/
plans/01_mobile-to-blaze-pwa-migration.md:692). Those are different progress/resume models.

Phase 0 must decide:

- whether the server records page transitions or only Unit transitions;
- how empty pages become durably completed;
- whether multi-item page responses are submitted as one batch;
- how the server proves all required submissions succeeded before advancement;
- whether partial Unit progress survives resume;
- and whether session.advance needs expectedPage, pageId, response operation IDs, and snapshot/version guards.

Meteor automatically retries unacknowledged method calls after reconnect, making the stated idempotency requirement
essential. See the official Methods/reconnection documentation.

### 5. Passwordless enrollment into an existing anonymous account is underspecified

The plan requires attaching a verified email to the existing learner without creating another account (
docs/plans/02_extended-authentication.md:53). But Accounts.requestLoginTokenForUser selects a user by the supplied
email; if it
finds none and creation is enabled, it may create another account.

A safe enrollment protocol is still needed:

1. authenticate the existing anonymous account;
2. reserve/attach the normalized email as unverified;
3. handle uniqueness races;
4. issue the passwordless proof for exactly that account;
5. activate the mode only after successful proof;
6. roll back failed or expired enrollment.

Accounts provides primitives, but it does not define that account-linking transaction. The plan recognizes the
duplicate-email policy but not the exact enrollment state machine.

### 6. “Protect the QR login handler with DDPRateLimiter” is imprecise

Accounts.registerLoginHandler participates in the Accounts login method. DDPRateLimiter limits DDP messages/methods; it
does not wrap a login handler as a separate endpoint. The current wording at docs/plans/02_extended-
authentication.md:93 could lead to a nonexistent handler-specific rule.

Specify whether the design relies on Accounts’ default login limit or adds a login method rule keyed by client
address/connection. Under Meteor 3.4, rate-limiter matcher functions must remain synchronous.

### 7. Offline replay needs to account for Meteor’s own retry queue

The offline plan correctly says that IndexedDB durability and conflict resolution are custom. But “replayed operations
call … Meteor.callAsync” (docs/plans/03_offline-and-client-data-management.md:64) does not define interaction with
Meteor’s in-memory DDP method queue and automatic retry.

The plan should decide whether outbox dispatch uses:

- normal retry plus server idempotency; or
- Meteor.applyAsync(..., { noRetry: true }) with the durable outbox as the sole retry owner.

Without this decision, one operation may exist simultaneously in the custom outbox and Meteor’s reconnect queue. Stable
operation IDs make this survivable but do not make acknowledgement and cleanup semantics unambiguous.

### 8. “No remaining review decisions” contradicts the plans themselves

The main plan says no decisions remain (docs/plans/01_mobile-to-blaze-pwa-migration.md:1080), while it defers the atomic
promotion mechanism to implementation and Phase 0 still must define success DTOs, error codes, page semantics,
replacement behavior, and stable IDs.

The authentication and offline plans openly list unresolved product/architecture decisions. That is appropriate, but
their status should be reflected consistently:

- main migration: “ready to begin Phase 0 contract resolution,” not fully decision-closed;
- extended authentication: blocked on listed product decisions;
- offline plan: intentionally conceptual until its Section 3 decisions are approved.

## Areas that are correctly understood

No correction is needed for these points:

- Meteor Accounts owns the authenticated identity and resume-token session, while restore-code policy remains
  application-specific.
- this.userId, argument validation, method rate limits, server-side scoring, and field-limited publications are
  correctly assigned.
- Pub/Sub is reserved for genuinely reactive data; bounded snapshots may be loaded by Methods.
- Server Mongo calls use async APIs, while Blaze helpers should normally read Minimongo synchronously.
- DDP.onReconnect exists in Meteor 3.4, but it is only a reconnect trigger—not a durability guarantee.
- Standard dynamic import() is supported by the Meteor bundler and is suitable for route-level lazy loading. See the
  official dynamic-import documentation.
- The distinction between Meteor’s client Session store and the lea.app learning Session is clear.
- DOMAIN.md correctly separates DDP connectivity, authentication restoration, cached content, and durable submissions.
- The offline plan correctly avoids generic service-worker caching of DDP/SockJS and authenticated responses.

No files were modified.
