# lea.app mobile-to-Blaze PWA migration plan

Status: proposal for review; no implementation is authorized by this document.

Date: 2026-08-31

## 1. Objective

Complete the migration of lea.app from the deprecated React Native client in
`deprecated/app` to the Meteor 3.4 + Blaze web client in `src`, while preserving
the learning-app workflow and its anonymous-user model.

The otu.lea repository is a technical reference, not the product specification.
In particular, its diagnostic workflow, supervised-user assumptions, test-cycle
evaluation, records, printing, and teacher-facing details must not leak into
lea.app. The useful otu.lea reference is its mature Blaze infrastructure and the
development-only immediate-feedback path in `imports/ui/pages/internal`.

## 2. Non-goals and constraints

- Do not modify `/home/jankapunkt/dev/leaonline/leaonline-otulea`.
- Do not read or modify `.deploy` or `.staging`.
- Do not replace Blaze or introduce TypeScript, React, another frontend, or a
  new state-management architecture.
- Keep Meteor 3.4 and the existing Meteor bundler during this migration.
  Rspack conversion and removal of nested imports are a later, independent
  project.
- Prefer the versions already proven by both Meteor 3.4 applications and stable
  package releases. Do not add alpha, beta, or RC dependencies. Existing RC
  dependencies, notably `fourseven:scss`, should be treated as inherited debt,
  not as precedent for adding more prereleases.
- Preserve the server/content synchronization boundary. The browser should not
  become a second content-sync authority.
- Preserve anonymous learning accounts and restore semantics unless a separately
  approved product decision changes them.

## 3. Evidence and current-state assessment

### 3.1 Runtime baseline

Both applications use Meteor 3.4, Blaze, Flow Router Extra, `leaonline:corelib`,
`leaonline:ui`, the lea collection/method/publication/rate-limit factories, and
the Meteor bundler. This makes selective reuse practical without a platform
migration.

The current `src` is already a partial web migration, not just a backend. It has:

- explicit client/server entry points;
- Blaze routing, templates, shared layout, i18n, TTS initialization, and theme;
- welcome/registration/login, overview, map, story, unit, and completion pages;
- local response and page caches;
- shared task renderers from `leaonline:ui`;
- shared data models (contexts) from `leaonline:corelib`;
- shared scoring from `leaonline:corelib`;
- a web manifest and service worker;
- server contexts for content, sessions, responses, progress, feedback, users,
  synchronization, errors, and analytics;
- method factories, argument schemas, account and method rate limiting, and a
  broad existing Mocha test suite.

This plan therefore stabilizes and completes the existing web path instead of
rebuilding it.

### 3.2 Source-of-truth hierarchy

When implementations disagree, use this order:

1. `DOMAIN.md` and confirmed product requirements.
2. The deprecated mobile app for learner workflow and behavior.
3. Current `src` server contracts and persisted lea.app data.
4. Shared `leaonline:corelib` and `leaonline:ui` contracts.
5. otu.lea for Blaze integration patterns and immediate-feedback mechanics.

The ordering is deliberate: otu.lea's diagnostic semantics must not override
the learning product.

### 3.3 Workflow parity map

| Mobile behavior | Current web location | Migration disposition |
| --- | --- | --- |
| Startup/config/session restoration | `startup/client`, `Session`, account utilities | Stabilize; define explicit boot states and recovery paths. |
| Anonymous registration and automatic login | `Users.methods.create`, welcome/register templates | Preserve; verify restore-code and terms behavior end to end. |
| Restore existing anonymous account | user/account contexts and welcome/login templates | Complete and test against mobile behavior. |
| Home/field selection | overview/home templates | Consolidate duplicate or transitional concepts; retain learner-facing field selection. |
| Dimension/level map and progress | server `MapData`/remap, mobile SVG components, current web card prototype | Replace the card prototype with the SVG learner-map architecture in section 4.4; preserve the mobile journey, current position, progress, competency indicators, milestones, and stage-to-dimension selection. |
| Unit-set story | story template and shared task renderer | Stabilize session advancement and replay behavior. |
| Choice, cloze, connect, highlight items | shared `leaonline:ui` renderers and corelib scoring | Verify subtype-by-subtype parity against mobile fixtures/tests. |
| Immediate correct/incorrect feedback | partial `onEvaluate` integration in current unit page; otu.lea internal reference | Complete as a learner feature with accessible visual/audio feedback. |
| Page/unit resume | `ResponseCache`, `UnitPageCache`, local storage | Correct and harden; define offline/reload semantics. |
| Server response persistence | `Response.methods.submit` | Repair contract and ownership checks before relying on it. |
| Unit/session completion | `Session.methods.next`, complete page | Simplify to learning feedback; exclude diagnostic reports and records. |
| Achievements/profile/TTS settings | partial server contexts; mobile profile screens | Port after the core learning loop is stable. |
| Connectivity/sync screen | partial loading/service-worker behavior | Recast for a PWA: explicit online, reconnecting, cached-shell, and unsent-response states. |

### 3.4 What to reuse from otu.lea

Reuse or adapt patterns, never copy indiscriminately:

- template initialization and named child-template data contracts;
- shared task renderer initialization;
- `ResponseCache`-backed `onInput`/`onLoad` callbacks;
- the internal page's client-side `Scoring.run(...)` evaluation approach;
- decomposed async loading helpers where they are compatible with lea.app
  contexts;
- template lifecycle cleanup, explicit loading/error states, and its Meteor
  Mocha patterns.
- i18n / localization pattern, especially when labels are page- or component-specific 

Do not port:

- diagnostic/test-cycle selection and orchestration;
- supervised identities, teacher roles, learner assignment, or SSO assumptions;
- diagnostic feedback aggregation, threshold grading, records/history, response
  inspection, or printing;
- internal content-search UI;
- otu.lea-specific collections or account packages unless independently needed
  by lea.app.

### 3.5 Known defects and design gaps to resolve first

These are observed planning inputs, not completed fixes:

- `Response.methods.submit` constructs its upsert selector with
  `responseDoc.unit`, while the schema and client use `unitId`.
- The response schema requires server-scored fields, while the current client
  submission builder sends only raw responses and its `scores` argument is
  unused. The immediate-feedback result is therefore not coherently persisted.
- The unit page can catch submission failure and still advance the session,
  risking lost answers and incorrect progress.
- Route callbacks pass inconsistent argument sets for unit/session/unit-set
  transitions.
- The story path mixes `unit` and `nextUnit` semantics and contains unfinished
  debug code.
- The completion page contains imports and diagnostic-style aggregation that do
  not match the current lea.app context layout; parts appear copied from an
  earlier otu.lea implementation.
- `ResponseCache.save` does not return the stored document although callers may
  expect a created value; cache flushing is global rather than scoped to the
  completed session/unit.
- Page progress is mutated optimistically in local session objects and can be
  double-counted across reload and retry paths.
- Several production paths still contain `debugger`, TODO/hotfix branches, and
  placeholder test failures.
- The current manifest still identifies the app as `otu.lea`.
- The service worker is an inherited generic implementation with a manual cache
  version, broad request caching, and no explicit response-outbox contract.
- At least one UI-loading test is explicitly marked as unimplemented.
- The package list includes the TypeScript compiler although the migration is
  JavaScript-only. Determine whether it is transitive/required before removing
  it; do not make package cleanup block workflow stabilization.

## 4. Target architecture

### 4.1 Client boundary

Use Blaze pages as orchestration components and `leaonline:ui` templates as
rendering components. Each page owns its `ReactiveVar`/template state,
callbacks, autoruns, subscriptions, timers, and cleanup. Pass named data and
callbacks to reusable templates; do not depend on implicit parent data.

Keep scoring adapters, response normalization, progress calculations, and
navigation decisions in plain JavaScript modules so they can be tested without
rendering Blaze.

Use synchronous Minimongo reads inside helpers. Async server/content calls
belong in lifecycle-owned loaders with explicit pending, success, empty, and
failure states.

### 4.2 Server boundary

The server remains authoritative for:

- anonymous identity and restore credentials;
- session ownership and legal state transitions;
- validation and persistence of responses;
- progress and achievements;
- content exposure and sensitive-field filtering;
- final completion state.

Every client-callable mutation must validate all arguments, derive `userId`
from the method invocation, verify that the session belongs to that user, and
be rate limited. A client score may be used for immediate presentation, but the
server must independently compute or verify the persisted score from canonical
item definitions.

Prefer one-shot methods for bounded content/session loading already used by
the app. Introduce publications only for data that genuinely needs reactive
updates. Any user-specific publication must filter by `this.userId` and project
only required fields.

### 4.3 Anonymous identity

Retain anonymous Meteor accounts: every learner has an internal account and all
server operations use an authenticated `userId`, but personal information is
not required unless the learner voluntarily enables email magic-link login.
"Anonymous" means no mandatory real-world identity, not unauthenticated access.

#### 4.3.1 Gradual authentication model

Use one active primary login mode per account:

| Mode | Routine login credential | Availability |
| --- | --- | --- |
| `code` | Human-readable login code | Default after registration. |
| `passwordless` | One-time email magic link/token from `accounts-passwordless` | Optional after email verification. |
| `qr` | Revocable, high-entropy QR login credential | Optional after explicit setup. |

Registration creates and logs in a code-mode account. After showing the
recovery material, ask whether the learner wants to add email magic-link or QR
login for improved security. This prompt must be optional, plain-language, and
skippable. The same choices must always be available in account settings.

Activating an added method replaces the current routine login method. After the
new credential has been proven, make it the only accepted primary mode and
reject the former login code for routine login. Do not retain multiple primary
methods as hidden fallbacks. Existing authenticated browser sessions remain
valid until logout, expiry/revocation, or an explicit token-revocation policy
invalidates them.

Switching modes is an authenticated, server-authoritative operation:

1. The learner starts setup in settings or the post-registration prompt.
2. Prove the new credential first by following its magic link or confirming the
   generated QR credential can be read back.
3. Atomically record the new mode and disable/revoke the old routine credential.
4. Confirm the change and explain that the restore code remains available only
   for emergency recovery.

Never disable the current mode merely because an email was entered or a QR was
displayed. Cancelled, expired, or failed setup leaves the old mode active.
Settings must support replacing the email, rotating the QR credential, and
deliberately returning to code mode after reauthentication or recovery.

#### 4.3.2 Passwordless email login

Use the stable `accounts-passwordless` release compatible with Meteor 3.4.
Setup must attach a verified email to the existing anonymous account; it must
not silently create another user. Subsequent token requests use sign-in-only
semantics (`userCreationDisabled: true`).

Requirements:

- verify control of the address before changing the primary mode;
- normalize email consistently and enforce a documented uniqueness policy;
- configure sender identity, magic-link URL, token length and expiry, and
  learner-friendly email content;
- rate-limit requests while returning ambiguous responses that do not reveal
  account existence;
- make tokens single-use and never log addresses, tokens, or magic-link URLs;
- handle links opened on the same device, another device, an installed PWA, and
  after expiry;
- retain recovery-code access when email access is lost.

Adding email reduces anonymity. The opt-in and privacy text must explain why it
is stored, how it is used, and when it is deleted.

#### 4.3.3 QR login

Treat QR login as a bearer credential, not a picture of a predictable account
identifier. Generate it with cryptographically secure randomness and encode a
versioned, opaque payload. Do not encode email, restore code, raw database
`_id`, or other learner data.

Store only a one-way hash plus credential id, version, creation time, and
revocation metadata. Use timing-safe comparison. Rate-limit login and return
ambiguous failures. Rotation revokes the previous QR credential.

Select and document one login flow before implementation:

- scan a persistent QR credential on the device that is logging in; or
- show a short-lived challenge QR on the new device and approve it from an
  already authenticated device.

The first supports a printable login QR, but possession of it grants access.
The second resists replay better, but cannot recover an account when no
authenticated device remains. Camera use must be optional and an accessible
non-camera fallback must exist.

The QR login credential and recovery QR below are distinct credential types
with different payload identifiers, labels, lifecycles, and revocation rules.

#### 4.3.4 Restore and recovery credential

Every account receives a high-entropy restore code at registration, regardless
of its primary login method. Present the same recovery credential as:

- a human-readable character sequence; and
- a QR image suitable for download or print.

The recovery QR only encodes the restore credential; it is not the QR primary
login credential. Use a versioned payload type so scanners route it to recovery
and safely reject unknown formats.

Show this material prominently after registration, require acknowledgement
that it has been saved, and expose it again in authenticated account settings
after reauthentication. Provide accessible text, print, and download paths and
never require a camera. Generate QR images inside the application trust
boundary, not through a third-party service.

After passwordless or QR login supersedes code login, the restore credential is
accepted only by a dedicated recovery flow. This is an explicit exception to
"only accepted login method," not another routine login choice. Recovery must
not silently downgrade the account to code mode. It restores access, shows the
configured primary mode, and lets the learner repair, rotate, or replace it.

The current implementation stores and queries the restore value directly and
derives password credentials from user-facing codes. Separate routine login
from recovery and store restore credentials with a slow password hash or keyed
server-side digest, not plaintext. Migrate existing accounts compatibly:
validate a legacy value once, replace it with the new representation, then
remove the legacy secret.

Rate-limit recovery, use non-enumerating errors, and never log entered or
encoded credentials. Recovery rotation invalidates both the old character
sequence and its QR rendering.

#### 4.3.5 Meteor session-token storage

For Meteor 3.4, login tokens are stored by default in browser Web Storage,
specifically `localStorage`, and survive browser restarts. Meteor also supports
`sessionStorage` through `clientStorage: 'session'`. An HttpOnly-cookie
resume-token flow has been opt-in since Meteor 3.3, but it is not the default.

Keep `localStorage` for the initial migration unless a separate
security/usability review chooses otherwise. Email and QR alter how a session is
established; afterward Meteor uses the same resume-token mechanism. Document
XSS, shared-device, multi-tab, installed-PWA, logout, and offline implications.

Settings should include "sign out this device" and "sign out all devices."
Define whether mode changes, credential rotation, recovery, and suspicious
login revoke existing resume tokens. Any HttpOnly-cookie change remains a
separately reviewed migration because it changes tab persistence, offline/PWA
behavior, tests, and deployment assumptions.

### 4.4 Learner map: SVG implementation

The map is a primary learner-navigation surface, not an alternative rendering
of otu.lea's diagnostic overview. Preserve the mobile map's spatial metaphor:

- a bottom-to-top journey from start to finish;
- alternating left/right stage placement connected by a continuous path;
- milestones separating levels;
- numbered, selectable stages;
- an overall progress ring on every stage;
- dimension-colored competency diamonds around each stage;
- map icons along the route;
- a visible current position and completed, available, and locked destinations;
- initial positioning at the learner's most recently active stage;
- stage selection followed by the dimension/unit-set choice represented by that
  stage.

The current collapsible-card implementation in `src/ui/pages/map` is a useful
data-loading prototype but does not satisfy map parity and should be replaced,
not extended into the final interaction.

#### 4.4.1 Data ownership and contracts

Keep the expensive topology generation on the server. `runRemap` and
`MapData.create` continue to run after configured content synchronization and
persist one read-optimized map document per field. Normal page requests must
never rebuild the map.

Treat the inputs as two separately versioned layers:

1. **Topology layer:** field, ordered dimensions, levels, stage/milestone
   entries, unit-set references, maximum progress/competencies, and icon
   references. It changes only after content sync/remap.
2. **Learner-state layer:** progress and competencies per unit set, current or
   resumable session, and derived completed/current/available/locked state. It
   changes as the learner works.

Do not mutate the cached topology with learner data as the mobile implementation
currently does. Build a new normalized view model in a pure JavaScript adapter.
This prevents cross-account cache leakage and makes progress refresh cheap.

Before UI implementation, version the map DTO and validate these invariants:

- exactly one map per field and at least one dimension, level, and entry;
- stable entry ids derived from topology, never random ids generated per render;
- stage entries contain at most one unit set per dimension;
- all dimension indexes, level indexes, unit-set ids, and icon references resolve;
- every denominator is positive and percentages are clamped to `0..100`;
- every populated level terminates in exactly one milestone;
- maximum progress/competency totals equal their stage/unit-set aggregates;
- remap replacement is atomic, so clients never load a partially rebuilt map.

The server or shared adapter must define the navigation policy that derives:

- `completed`: all required work for the stage is complete;
- `current`: contains the most recently active/resumable unit set;
- `available`: may be selected now;
- `locked`: visible but cannot yet be selected.

Do not infer access control solely from SVG styling. The session-start method
must enforce the same policy server-side.

#### 4.4.2 Normalized render model

Introduce a framework-neutral `createMapViewModel`-style module that receives
topology, dimensions, levels, icons, learner progress, and viewport/layout
options and returns immutable render records.

Each record should include:

- stable `id`, source index, type, level, and semantic label;
- logical position (`left`, `center`, or `right`);
- SVG coordinates and connector path to the next record;
- stage progress `{ current, max, percent }`;
- ordered dimension indicators with color, icon, current/max competencies, and
  percent;
- learner state and selection metadata;
- associated unit-set choices;
- accessible name and description;
- whether it is the initial/current navigation target.

Keep layout math independent of Blaze and the DOM. Unit-test it with fixed
viewport widths and topology fixtures. Use deterministic coordinates so resize,
reload, tests, and server/client logging describe the same map entry.

#### 4.4.3 SVG scene

Render the journey as inline SVG using standards available in supported
browsers; do not add a canvas/game framework.

Use:

- one responsive `<svg>` scene with a logical `viewBox` and
  `preserveAspectRatio`;
- `<path>` elements for the continuous route/connectors;
- `<circle>` elements with `stroke-dasharray` and `stroke-dashoffset` for
  progress rings;
- `<polygon>` or reusable `<symbol>/<use>` definitions for competency
  diamonds, milestones, start/finish markers, and trusted map icons;
- `<g>` per logical entry so position and state can be updated as a unit;
- CSS custom properties/classes for dimension colors and state styling;
- `vector-effect="non-scaling-stroke"` where connector/ring stroke width must
  remain legible while responsive;
- native SVG `<title>` and `<desc>` as supplemental descriptions.

Generate SVG nodes through Blaze templates or DOM/SVG APIs. Do not concatenate
map data into raw HTML, triple braces, or `SafeString`. Validate/sanitize synced
icon definitions before registering them as SVG symbols; map icons are content,
not executable markup.

A vertical scroll container should contain the responsive SVG. The logical
coordinate system remains stable while its CSS width adapts. On narrow screens,
stages remain large enough for touch rather than shrinking the entire map below
the minimum target size. On wide screens, cap the journey width to preserve the
intended zig-zag and avoid excessively long connectors.

#### 4.4.4 Blaze component boundaries

Split the final implementation into small components with named arguments:

- `mapPage`: loads field/topology/progress, handles route outcomes and errors;
- `learnerMap`: owns the SVG scene, viewport state, selection, focus, and
  observers;
- `mapStage`: stage ring, number, learner state, and dimension indicators;
- `mapMilestone`: level separator and aggregate progress;
- `mapConnector`: deterministic route path and optional icon;
- `mapStageChooser`: accessible HTML dialog/panel listing dimension/unit-set
  choices for the selected stage.

The template instance owns `ReactiveVar`/state, autoruns, observers, animation
frames, and event cleanup. Pass topology/view records and callbacks explicitly.
Keep the HTML chooser outside the SVG so forms, buttons, TTS, focus trapping,
errors, and session continue/restart decisions remain robust and accessible.

Progress updates should replace only the learner-state/view-model data. Avoid
destroying and recreating the entire scene, which would lose focus and scroll
position.

#### 4.4.5 Responsive layout and Web APIs

Use platform APIs with feature-safe fallbacks:

- `ResizeObserver` on the map container recalculates the small set of layout
  breakpoints/coordinates; debounce computation through
  `requestAnimationFrame`.
- `IntersectionObserver` marks distant map regions as outside the viewport so
  decorative icons/animations can be paused. The full semantic navigation must
  remain available without it.
- `Element.scrollIntoView` positions the current stage after the first stable
  layout. Respect `prefers-reduced-motion` and use instant scrolling when
  reduced motion is requested.
- `matchMedia` observes reduced-motion, contrast, and relevant responsive
  queries where CSS alone cannot drive behavior.
- `PointerEvent` provides a single mouse/touch/pen interaction path. Use event
  delegation at the SVG root instead of one global listener per decorative
  element.
- `document.fonts.ready`, where supported, may gate the initial measurement if
  labels affect geometry; layout must still work without it.
- `requestIdleCallback` may prepare noncritical offscreen decorations, with a
  `setTimeout` fallback. It must not delay stages, progress, or navigation.

Observers and scheduled callbacks must be disconnected/cancelled in
`onDestroyed`. Resize callbacks must use the latest generation of data so an
older asynchronous layout cannot overwrite a new field/map.

#### 4.4.6 Performance strategy

Start with a single SVG because the map topology is expected to contain tens,
not tens of thousands, of entries. Set measurable budgets before adding
virtualization: maximum node count, initial render time, resize work, and input
latency on the lowest supported device.

Optimize in this order:

1. Fetch the topology once per field/version and cache it separately from
   learner progress.
2. Normalize data and compute coordinates once per topology/width class, not in
   Spacebars helpers.
3. Reuse SVG symbols for repeated shapes/icons.
4. Update progress/state attributes without rebuilding static paths.
5. Batch DOM-affecting updates in one animation frame.
6. Pause offscreen decoration and nonessential animation.
7. Lazy-load the map route module and large optional icon sets while staying on
   the Meteor bundler.

Only introduce windowed SVG rendering if profiling exceeds the agreed budgets.
If required, window complete level-sized SVG groups with overscan, retain stable
spacers/viewBox coordinates, and never unmount the focused/current stage.
Browser `content-visibility` may be evaluated for surrounding HTML regions but
must not be assumed to optimize SVG internals.

#### 4.4.7 Accessibility and interaction

SVG appearance is not the only interface. Provide equivalent semantic
navigation:

- each selectable stage is keyboard-focusable with button semantics, an
  accessible name, state description, and Enter/Space activation;
- arrow-key navigation follows journey order; Home/End move to start/current
  endpoints where appropriate;
- locked stages expose why they are unavailable and cannot invoke a session;
- current position uses text/icon/state, not color alone;
- progress exposes exact text values; rings and diamond fill are decorative
  duplicates;
- focus indicators remain visible at 200% zoom and in high-contrast/forced-color
  modes;
- touch targets meet the approved minimum size;
- TTS can read the field, stage, level, progress, and available dimensions;
- animations are restrained and disabled/reduced under
  `prefers-reduced-motion`;
- a structured HTML list fallback exposes the same stages and actions if SVG or
  advanced APIs fail.

Selecting a stage opens `mapStageChooser`, announces its heading, moves focus
into it, and returns focus to the stage when closed. Starting/continuing a unit
uses the existing server session flow and shows a busy state without losing map
position.

#### 4.4.8 Loading, caching, updates, and failure states

Render distinct states for:

- topology loading;
- progress loading over an already visible topology;
- empty field/map;
- stale topology version during remap;
- integrity failure/unresolved content reference;
- offline with cached topology/progress;
- session-start failure;
- topology updated while the learner is viewing the map.

Cache keys must include account id, field id, topology version, and schema
version as applicable. Static topology may be shared across accounts; progress,
current position, and sessions must never be. After a successful unit/session
update, refresh the learner-state layer and preserve the selected/current stage
and scroll anchor.

A remap should write a new complete document/version before making it current.
Clients seeing a newer version invalidate derived geometry and icon caches,
rebuild once, then restore focus/scroll by stable entry id.

#### 4.4.9 Map-specific verification

Cover at least:

- server remap invariants, atomic replacement, deterministic ordering, and
  missing TestCycle/UnitSet/Unit failures;
- view-model layout for empty, single-stage, uneven-dimension, multi-level, and
  large maps;
- percentage clamping and zero/missing progress;
- start/stage/milestone/finish connector continuity at narrow and wide widths;
- all learner states and the server-side availability check;
- current-stage initial positioning and preservation after refresh/resize;
- keyboard, pointer, touch, screen-reader, TTS, zoom, reduced-motion, forced
  colors, and HTML fallback behavior;
- observer cleanup and repeated route entry under Blaze HMR;
- offline cached rendering and topology-version invalidation;
- performance budgets on a production-sized map and lowest supported device;
- screenshot/visual-regression fixtures for representative maps.

Gate the map migration on a side-by-side product review against the mobile map,
not against otu.lea's overview.

### 4.5 Immediate-feedback contract

Define one canonical adapter between task renderers and scoring:

1. An item renderer reports normalized responses through `onInput`.
2. The page cache stores raw responses keyed by session, unit, page, and item.
3. On learner evaluation, the adapter locates the canonical content element and
   invokes corelib scoring.
4. The renderer displays item-level correct/incorrect/undefined feedback and
   optional sound without exposing diagnostic competency details.
5. Raw responses are submitted to the server; the server scores or verifies
   them and persists a canonical response document.
6. Page/session advancement occurs only after a successful durable submission,
   or after an explicitly designed outbox has durably queued it.

Decide and document before implementation whether a learner can retry an item,
how many times, when the correct answer is revealed, and whether the first or
final attempt contributes to progress. These are product semantics absent from
the current technical code and materially affect persistence.

### 4.6 PWA/offline boundary

Use progressive enhancement in two milestones:

- Milestone A: installable, cache the application shell and immutable assets,
  show connection status, and recover safely after reconnect. Do not claim that
  a unit is available offline unless all of its content/media is cached.
- Milestone B: optional offline learning with a versioned content cache and a
  durable response outbox. This requires conflict, ordering, retry,
  idempotency, logout/account-switch, and cache-eviction rules.

Do not let the service worker cache DDP/SockJS traffic or authenticated dynamic
responses as generic assets. Treat cached learner data as sensitive local data
and clear or partition it by anonymous account.

## 5. Implementation phases

Each phase ends with a reviewable, releasable gate. Later phases should not
start until the gate is met.

### Phase 0: lock the behavioral contract

Deliverables:

- Convert the workflow map above into acceptance scenarios using mobile screen
  behavior and representative production-like content fixtures.
- Inventory all mobile item subtypes, instruction variants, media types, TTS
  behavior, empty-page behavior, and accessibility interactions.
- Record decisions for retry/reveal/scoring semantics and anonymous-account
  lifecycle.
- Approve the primary-mode state machine, QR login flow, recovery exception,
  legacy credential migration, and resume-token revocation policy.
- Record what “offline” means for the first production release.
- Capture a minimal golden learning journey: register/restore, choose field,
  choose unit set, story, every item subtype, immediate feedback, resume,
  complete, and see updated progress.

Gate: product owner approves the parity checklist and immediate-feedback rules.

### Phase 1: establish a trusted test and package baseline

Deliverables:

- Add/normalize `src/package.json` scripts that invoke the repository's
  `test.sh` entry point as instructed by project documentation, without
  replacing the Meteor test runner.
- Run lint and existing server/client tests; classify failures as pre-existing,
  environment-specific, or migration blockers.
- Ensure client tests actually connect to a browser runner; a server-only green
  run is not sufficient.
- Add contract tests for route argument construction, context method schemas,
  and representative shared-renderer payloads.
- Pin or document all directly used Atmosphere packages. Replace prerelease
  packages only where a compatible stable release is proven; do not combine a
  broad dependency upgrade with workflow changes.
- Confirm the app stays on the Meteor bundler and retain nested-import support.

Gate: repeatable lint/test commands and a documented baseline with no unknown
core-loop failures.

### Phase 2: repair server contracts and ownership

Deliverables:

- Define canonical `Session` and `Response` method DTOs and remove field-name
  drift (`unit` versus `unitId`, unit-set identifiers, score types).
- Make response submission idempotent with a unique logical key such as
  `(userId, sessionId, unitId, page, itemId, attempt-policy)` and a matching
  Mongo index.
- Validate that session, unit set, unit, page, and item belong together before
  accepting a response.
- Score or verify responses server-side using canonical content.
- Make progress/session advancement atomic enough that retries cannot duplicate
  progress. If a Mongo transaction is not appropriate, use idempotent state
  transitions and guarded updates.
- Return intentional `Meteor.Error` codes suitable for learner-facing recovery.
- Audit all methods and any publications for authentication, field projection,
  argument checks, and rate limits.
- Preserve compatibility with still-supported mobile clients until their EOL;
  version an endpoint or accept both payloads temporarily when a breaking
  change cannot be coordinated.

Gate: method integration tests prove cross-user isolation, validation,
idempotent retry, correct scoring, and no advancement after rejected writes.

### Phase 3: stabilize navigation, loading, and session recovery

Deliverables:

- Define a single route parameter contract for overview -> map -> story -> unit
  -> completion and back/exit paths.
- Extract a plain-JavaScript session transition function and test all states:
  new session with/without story, resumed page, next unit, next unit set,
  completed session, stale URL, deleted content, and signed-out user.
- Replace overlapping async autorun work with a generation token or serialized
  loader so stale requests cannot overwrite the latest route state.
- Give every page explicit loading, empty, recoverable error, fatal error, and
  reconnecting states.
- Scope caches by user/session and clean them only after confirmed persistence.
- Remove debugger statements and placeholder failure branches from the core
  path.

Gate: refresh, browser back/forward, duplicate click, disconnect/reconnect, and
stale deep-link tests all converge on the correct session state.

### Phase 3B: implement the learner SVG map

Deliverables:

- version and validate the server-generated map topology and make remap
  replacement atomic;
- replace random/current card view ids with stable topology-derived entry ids;
- implement and unit-test the immutable map view-model/layout adapter;
- build the responsive SVG scene and accessible HTML stage chooser using the
  component boundaries in section 4.4;
- merge learner progress without mutating cached topology or leaking state
  across accounts;
- implement completed/current/available/locked states and enforce availability
  in the session-start method;
- restore the learner's current map position after load, resize, progress
  refresh, reconnect, and topology update;
- add responsive, accessibility, observer-cleanup, visual-regression, and
  production-sized performance coverage;
- retain the current card/list representation only as the no-SVG fallback until
  the accessible structured fallback is complete.

Gate: side-by-side product review confirms parity with the mobile journey map,
all stage-to-dimension-to-unit-set navigation works, accessibility checks pass,
and measured rendering stays within the agreed lowest-device budgets.

### Phase 4: complete renderer parity and immediate feedback

Deliverables:

- Build the canonical feedback adapter described in section 4.5, based on
  otu.lea internal's proven callback shape but owned by lea.app.
- Verify choice, cloze text/select, connect, and highlight against mobile
  scoring fixtures, including absent, null, empty, undefined/skipped, repeated,
  and malformed responses.
- Preserve mobile instruction variants, story/media rendering, Markdown, image
  behavior, and TTS.
- Add accessible status text and live-region behavior in addition to color and
  sound. Respect reduced-motion and sound preferences.
- Prevent navigation while evaluation/submission is unresolved; provide a clear
  retry path on network or validation failure.
- Keep competency identifiers and diagnostic grading out of immediate learner
  feedback unless explicitly approved.

Gate: the golden journey passes for every item subtype on keyboard, touch, and
  representative narrow/wide viewports, with identical client/server scoring.

### Phase 5: complete learner workflow and secondary features

Deliverables:

- Align field/dimension/level selection and the learning map with mobile
  behavior, including locked/unlocked and current-position semantics.
- Replace the diagnostic-derived completion page with learner-oriented summary,
  motivational feedback, achievements, and next-step actions.
- Port profile features that remain product requirements: TTS voice/speed,
  restore-code display/request, account deletion, legal information, and
  achievements.
- Confirm analytics/error logging remains anonymous and avoids raw learner
  responses or restore credentials.
- Remove or clearly isolate transitional pages (`home`, duplicate login paths,
  debug-only contexts) once no route imports them.

Gate: approved mobile parity checklist passes, excluding documented mobile-only
hardware behavior.

### Phase 6: PWA hardening

Deliverables:

- Correct manifest name, description, theme, icons, start URL, and install
  behavior for lea.app.
- Replace the inherited service-worker behavior with a versioned, tested cache
  policy for shell and immutable build assets.
- Add an update-available flow so active learner work is not destroyed by an
  uncontrolled service-worker activation.
- Add online/reconnecting/offline UI and test SockJS/DDP exclusion explicitly.
- If Phase 0 approved offline learning, implement the content cache and response
  outbox as a separate subphase with idempotent replay and account isolation.
- Test storage quota/eviction, cleared site data, private browsing limitations,
  and app update during an active unit.

Gate: installability and cache behavior pass browser audits and manual tests;
no stale bundle or cross-account learner data survives the defined cleanup
rules.

### Phase 7: accessibility, compatibility, and release readiness

Deliverables:

- Perform keyboard, focus-order, screen-reader announcement, contrast, zoom,
  reduced-motion, and touch-target checks with special attention to all item
  renderers.
- Test the supported browser/device matrix, including mobile Safari and Android
  Chromium in installed and browser modes.
- Add browser E2E coverage for one full successful learning loop and rejected,
  offline/retry, restore-account, and resume-after-refresh paths.
- Measure initial bundle, route-load time, media behavior, and slow-network
  usability; lazy-load route-specific code without moving to Rspack.
- Document rollout, backward compatibility with the mobile client, telemetry,
  rollback, and mobile EOL criteria.
- Run a staged pilot before broad release.

Gate: all release criteria are green and the mobile EOL decision is made from
observed migration/restore success, not merely feature completion.

## 6. Test strategy

Use the existing `meteortesting:mocha` setup and repository `test.sh`.

- Plain unit tests: scoring adapters, response normalization, route builders,
  transition state machine, progress math, cache keying, and feedback mapping.
- Server integration tests: invoke registered method handlers with explicit
  `userId` contexts and real Mongo collections; cover allowed and rejected
  operations.
- Client/Blaze tests: template state, callback payloads, loading/failure states,
  cleanup, and synchronous Minimongo reads.
- Contract tests: run the same item fixtures through client feedback scoring and
  server persistence scoring and require equivalent canonical scores.
- Browser E2E: full learner journeys with real DDP, reload, connection loss,
  duplicate actions, and service-worker updates.
- Authentication E2E: code registration/login, optional-mode setup failure and
  success, magic link across devices, QR login/rotation, text and QR recovery,
  legacy credential migration, method supersession, and token revocation.
- Map tests: remap and DTO integrity, deterministic view-model geometry, SVG
  continuity and states, stage chooser/session enforcement, responsive resize,
  current-position restoration, accessibility, visual regression, and
  performance budgets.
- Manual exploratory checks: TTS voices, touch interactions, installed PWA,
  storage eviction, assistive technology, and content/media edge cases.

Do not mock Mongo for server contract tests. Do not consider tests complete if
the browser suite did not connect.

## 7. Review checkpoints and recommended pull-request sequence

Keep changes small and independently reviewable:

1. Behavioral contract and regression fixtures.
2. Test harness/baseline only.
3. Response/session server contracts and migrations/indexes.
4. Route/session state stabilization.
5. Server map DTO/remap contract, SVG map/view model, and mobile parity gate.
6. Immediate-feedback adapter and one item subtype.
7. Remaining item subtypes and accessibility.
8. Completion, progress, profile, and achievements.
9. Manifest/service worker and optional offline outbox.
10. Cross-browser hardening and release documentation.

Avoid mixing package upgrades, data migrations, server contracts, and visual
redesign in one pull request.

## 8. Open decisions required before implementation

1. What exactly counts for progress after retries: first attempt, last attempt,
   or completion regardless of correctness?
2. Does feedback reveal the correct answer, and if so after which attempt?
3. Is offline completion required for the first web release, or only an
   installable/reconnecting PWA?
4. How long must the old mobile client remain compatible with the backend?
5. Which profile/achievement screens are mandatory for first release?
6. Should anonymous browser accounts persist indefinitely, and what user-facing
   warning is required before clearing browser data or changing devices?
7. What is the supported browser/device and accessibility conformance target?
8. Which QR login flow is required: persistent bearer QR or cross-device
   short-lived approval challenge?
9. Which events revoke existing Meteor resume tokens: mode change, QR/recovery
   rotation, recovery use, email replacement, or only explicit sign-out?
10. May recovery restore a session directly, or must it require immediate setup
    of a new primary login method?
11. What exact progression rule makes a stage available or locked, and may
    learners revisit any completed stage?
12. Should the initial map anchor be the last active stage, the first incomplete
    stage, or a separately persisted learner choice?
## 9. Definition of migration complete

The migration is complete when:

- all approved mobile learner workflows work in the Blaze PWA;
- every supported item subtype gives immediate, accessible feedback and client
  and server scores agree;
- anonymous registration, gradual login-method setup/supersession, restore,
  credential rotation, logout, deletion, and resume are reliable;
- responses and progress are durable, owner-scoped, idempotent, and recoverable
  after network interruption;
- the SVG learner map preserves the mobile spatial journey, progress,
  competency indicators, current position, and allowed next destinations;
- otu.lea diagnostic behavior is absent from the learner product;
- installability and the approved offline level work on supported browsers;
- lint, unit, Meteor integration, client, and E2E suites pass;
- no migration-blocking debugger/TODO/placeholder path remains;
- mobile compatibility/EOL and rollback procedures are documented;
- the app remains on Meteor 3.4 + Blaze + the Meteor bundler unless a later,
  separately reviewed plan changes that baseline.

## 10. Technical references

- Meteor application structure: https://docs.meteor.com/tutorials/application-structure/
- Meteor Blaze tutorial (includes Meteor-bundler example):
  https://docs.meteor.com/tutorials/blaze/
- Meteor accounts: https://docs.meteor.com/tutorials/accounts/accounts
- Meteor accounts API (storage and HttpOnly-cookie behavior):
  https://docs.meteor.com/api/accounts.html
- Blaze template lifecycle: https://www.blazejs.org/api/templates.html
- Blaze reusable components:
  https://www.blazejs.org/guide/reusable-components.html
- Local domain definition: `DOMAIN.md`
- Existing workflow/sync notes: `docs/guide/APP_FLOW.md`,
  `docs/guide/APP_SYNC.md`, and `docs/guide/BACKEND_SYNC.md`

