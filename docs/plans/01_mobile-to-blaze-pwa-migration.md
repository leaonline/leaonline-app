# lea.app mobile-to-Blaze PWA migration plan

Status: proposal for review; no implementation is authorized by this document.

Date: 2026-09-02

## 1. Objective

Complete the migration of lea.app from the deprecated React Native client in
`deprecated/app` to the Meteor 3.4 + Blaze web client in `src`, while preserving
the learning-app workflow and its anonymous-user model.

The otu.lea repository (located outside of this workspace under `../leaonline-otu.lea`)
is a technical reference, not the product specification.
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
- Preserve server-startup synchronization from `lea.content` into the lea.app backend as a required
  production-content promotion boundary. Learners must read the backend's approved snapshot, never
  live editorial data, and the browser must not become a second content-sync authority.
- Do not introduce continuous/live content propagation. Unfinished or in-development Units and
  related content must remain invisible until an operator explicitly enables synchronization and a
  complete, validated backend snapshot plus derived read models is ready.
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

### 3.2 Legacy evidence baseline

The legacy documentation is a generated/historical snapshot, not a second implementation target.
Its strongest consistent evidence establishes these boundaries:

- startup initialized exception handling, settings validation, local contexts, TTS, and sound
  before revealing the application; authentication restoration and connectivity then proceeded
  independently;
- anonymous registration created and immediately authenticated an internal Meteor account, while
  recovery used separate human-entered recovery material and same-device return used a stored
  resume token;
- internet reachability and backend/DDP reachability were distinct, with automatic reconnect and a
  warning that did not destroy the current navigation state;
- reference sync compared context hashes, fetched changed contexts as complete snapshots, removed
  obsolete local documents, persisted the snapshot, and updated the hash only after success;
- the home screen selected a Field; the map combined static field topology with separately loaded
  user progress; a Stage then led to a Dimension/UnitSet selection;
- map topology was precomputed on the backend after explicitly configured content import, not built
  by each client. The client added only render geometry and learner-state projection;
- a Session belonged to one user and UnitSet, distinguished story/current/next/completed states, and
  followed the UnitSet's ordered Unit list;
- a Unit page could be empty or contain multiple independently keyed items. “Check” performed
  immediate client feedback, and completion returned through refreshed learner progress;
- completion was motivational (celebration, feedback phrase, optional appraisal), while profile
  exposed achievements, TTS settings, recovery/account actions, and deletion;
- achievements were read models over precomputed attainable maxima and learner progress, not
  diagnostic evaluations.

Some legacy artifacts contradict this intent or contain confirmed bugs: an old guide says every
page has exactly one item, local session restoration failed to dispatch restored values, response
upsert used `unit` instead of `unitId`, client-scored payloads were trusted, errors could be swallowed
before advancement, map cache objects were mutated with learner data, and some connectivity test
steps are incomplete. These are repair evidence, not parity requirements.

The legacy backend has also already evolved in `src`. Before changing a current method, collection,
or persisted shape, compare the historical intent with current code and migration compatibility.
Do not restore an obsolete backend solely because generated docs show it.

One legacy boundary is explicitly still normative: configured synchronization from `lea.content`
into backend-local collections on server startup. It creates a deliberate publication step between
editorial work and learner-visible content. The web migration must retain this behavior so content
authors can develop unfinished Units without exposing them to learners. This is not an offline cache
optimization and must not be removed as obsolete mobile infrastructure.

### 3.3 Source-of-truth hierarchy

When implementations disagree, use this order:

1. `AGENTS.md`, `DOMAIN.md`, confirmed product requirements, and approved product decisions.
2. This approved migration plan's explicit contracts.
3. Consistent deprecated-mobile learner workflow, source, and tests.
4. Shared `leaonline:corelib` and `leaonline:ui` domain/renderer contracts.
5. Current persisted data and supported backend contracts for migration compatibility.
6. Current implementation and generated legacy API docs as evidence, not automatic authority.
7. otu.lea for Blaze integration patterns and immediate-feedback mechanics only.

The ordering is deliberate: otu.lea's diagnostic semantics must not override
the learning product.

### 3.4 Workflow parity map

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
| Page/unit resume | `ResponseCache`, `UnitPageCache`, local storage | Correct and harden for reload/reconnect; full offline learning is deferred. |
| Server response persistence | `Response.methods.submit` | Repair contract and ownership checks before relying on it. |
| Unit/session completion | transitional `Session` context and complete page | Replace ambiguous/nonexistent transition calls with the explicit session API in section 4.5; retain learner feedback and exclude diagnostic reports/records. |
| Achievements/profile/TTS settings | partial server contexts; mobile profile screens | Port every mobile screen after the core learning loop is stable. |
| Connectivity/sync screen | partial loading/service-worker behavior | Recast for a PWA: explicit online, reconnecting, cached-shell, and failed/pending submission states. |

Workflow invariants behind this table:

- restore-token login, backend connectivity, and reference-data sync are independent boot states;
- field -> stage -> dimension/unit-set -> story -> unit/page -> completion are distinct state
  transitions even if web routes render some of them together;
- story advancement does not count as Unit completion, and a resumed active session must not replay
  the story by default;
- pages support zero, one, or multiple items; cache and persistence keys include item identity;
- immediate evaluation is formative client feedback, while durable response/progress authority stays
  on the server;
- completion is not final until the session transition and Progress update succeed; map and
  Achievements then consume refreshed read models;
- optional appraisal never changes score, progress, completion, or availability;
- all secondary profile features remain outside the core learning loop.

### 3.5 What to reuse from otu.lea

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

### 3.6 Known defects and design gaps to resolve first

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
  version and request caching broader than the approved static-asset boundary.
- At least one UI-loading test is explicitly marked as unimplemented.
- The package list includes the TypeScript compiler although the migration is
  JavaScript-only. Determine whether it is transitive/required before removing
  it; do not make package cleanup block workflow stabilization.

## 4. Target architecture

The target preserves the historical three-layer authority model while replacing its mobile
mechanisms:

| Concern | Historical owner | PWA owner/boundary |
| --- | --- | --- |
| Editorial content | `lea.content` | upstream workbench/source; never queried live by learners |
| Production content snapshot | backend startup sync | required backend-local, explicitly promoted learner snapshot |
| Map/achievement maxima | backend remap | backend-derived, versioned read models |
| Reference cache | AsyncStorage collections + sync hashes | versioned browser cache/Minimongo; never content authority |
| Identity/session/response/progress | Meteor backend | authenticated Meteor server methods and collections |
| Current input/page state | React context/device storage | account/session-scoped browser cache; provisional only |
| Immediate feedback | mobile scorer/renderers | shared canonical adapter for accessible feedback |
| Connectivity | native reachability + DDP events | browser reachability hints + authoritative DDP/method state |

Framework translation must preserve outcomes, not native mechanisms. Expo SecureStore, app
background callbacks, vibration, native stack transitions, and AsyncStorage are not themselves web
requirements. Their purposes map respectively to an approved browser credential policy, lifecycle
recovery, optional accessible celebration, deterministic route/state transitions, and scoped
versioned storage.
In this context it is mandatory to understand the capacities provided by the Meteor framework
and/or available packages to implement any of these requirements.
For example, Meteor utilizes an exhaustive accounts system for managing accounts and authentication.

### Meteor 3.4 realization baseline

Use the pinned Meteor 3.4 API and maintained packages before introducing infrastructure:

- Accounts owns anonymous users, password/code login, browser resume tokens, logout, and
  authenticated `userId`; do not create an app-local auth token/session protocol.
- Register server operations through the existing Method factories backed by `Meteor.methods`, use
  async handlers/`Meteor.callAsync`, derive identity from the invocation, return `Meteor.Error`, and
  use `check`/`Match` plus the existing schema wrappers.
- Apply `DDPRateLimiter` and Accounts' default login limits through existing project factories;
  never implement process-local request counters.
- Drive connection UI from reactive `Meteor.status()` and use `Meteor.reconnect()`/
  `DDP.onReconnect` for explicit reconnect coordination; browser reachability is supplementary.
- Use `Meteor.publish`/`Meteor.subscribe` and Minimongo for genuinely reactive bounded data, and
  Methods for bounded snapshots where reactivity adds no value; do not create a second transport.
- Use Template lifecycle, Tracker, `ReactiveVar`, and `ReactiveDict` for Blaze-owned state. Meteor's
  client-only `Session` store is not the lea.app learning Session model.
- Use Meteor 3 async Mongo APIs, `createIndexAsync`, unique indexes, and atomic single-document
  updates/upserts. Use raw Mongo transactions only for a documented cross-document invariant.
- Run controlled import/remap orchestration through `Meteor.startup` and `Meteor.settings`; these
  hooks do not replace the app-specific last-known-good promotion protocol.
- Coordinate active-work-safe updates with `autoupdate`/WebApp update hooks and the service worker;
  do not add a parallel bundle-version poller.
- Use Meteor modules/dynamic `import()` for route-level lazy loading on the Meteor bundler.

The implementation review must list each new infrastructure abstraction in these areas and record
why the Meteor capability or existing project wrapper was insufficient.

### 4.0 Controlled content promotion

Backend startup synchronization remains part of the target architecture. Its purpose is release
isolation, not merely transport: `lea.content` may contain unfinished, revised, or internally tested
learning material, whereas lea.app learners must see only the last deliberately promoted snapshot.

The implementation contract is:

1. Normal application reads use backend-local content collections and content-derived read models.
   There is no request-time fallback or proxy to live `lea.content` data.
2. Operators explicitly configure which complete collections synchronize at startup and explicitly
   disable synchronization when the intended snapshot has been imported.
3. Import validates document shape and cross-collection references needed by the app. Remap,
   achievement maxima, ordering, and client sync-state hashes/versions are derived from that same
   imported snapshot.
4. A new snapshot becomes learner-visible only after import and required derivations succeed as one
   controlled promotion. The exact staging/atomic-switch mechanism may be refined during
   implementation, but mixed-version or partially rebuilt learner data is not acceptable.
5. Failure preserves the last known-good learner snapshot, emits an actionable operational error,
   and does not advance client-visible content versions.

Server restart by itself must not imply importing editorial changes: synchronization remains gated
by explicit configuration. Conversely, the migration must not remove the startup-sync path merely
because the browser can fetch or cache data differently.

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

Own reactive computations through Tracker/Template lifecycle and stop them during teardown. Prefer
`ReactiveVar` or `ReactiveDict` for template-local state; add another state container only for a
documented capability gap.

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

Meet these infrastructure requirements through the existing factories backed by `Meteor.methods`,
`check`/`Match`, `audit-argument-checks`, and `DDPRateLimiter`. Feature modules must not reimplement
RPC dispatch, invocation identity, validation auditing, or rate-limit storage.

Prefer one-shot methods for bounded content/session loading already used by
the app. Introduce publications only for data that genuinely needs reactive
updates. Any user-specific publication must filter by `this.userId` and project
only required fields.

### 4.3 Anonymous identity

Retain anonymous Meteor accounts: every learner has an internal account and all
server operations use an authenticated `userId`. "Anonymous" means no mandatory
real-world identity, not unauthenticated access.

Migration scope is limited to the code-based account flow needed for mobile
parity:

- use `accounts-base` + `accounts-password`, `Accounts.createUserAsync`, and
  `Meteor.loginWithPassword` with a generated/code-based username/password combination, following
  the established otu.lea integration pattern;
- create and log in the anonymous account during registration;
- restore the Meteor resume token on the same browser when available;
- retain the existing dedicated restore-code flow for another browser/device;
- preserve terms acceptance, logout, account deletion, restore-code display,
  rate limiting, non-enumerating errors, and secret-safe logging;
- retain normal Meteor browser-session persistence and logout behavior. Enhanced
  cleared-storage/device-change warnings and client-data lifecycle controls are
  deferred to `03_offline-and-client-data-management.md`.

Use Accounts login/logout hooks and reactive `Meteor.userId()`/`Meteor.loggingIn()` state for route
gating. Do not read/write `services.resume` directly or create a parallel token store. Field-limit
user reads/publications and never publish the `services` object.

Passwordless email, QR login/recovery presentation, Google/OAuth, credential
mode supersession, account merging, credential rotation, and related token
revocation policy are not migration requirements. They belong to
`02_extended-authentication.md` and must not block or silently expand this plan.

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
- a visible current position and completed/incomplete destinations; every stage
  remains selectable in the initial release;
- initial positioning at the active incomplete stage, otherwise the next
  incomplete stage;
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
   resumable session, and derived completed/current state. It
   changes as the learner works.

Do not mutate the cached topology with learner data as the mobile implementation
currently does. Build a new normalized view model in a pure JavaScript adapter.
This prevents cross-account cache leakage and makes progress refresh cheap.

Before UI implementation, version the map DTO and validate these invariants:

- exactly one map document per field and at least one dimension, level, and entry;
- stable entry ids derived from topology, never random ids generated per render;
- stage entries contain at most one unit set per dimension;
- all dimension indexes, level indexes, unit-set ids, and icon references resolve;
- every denominator is positive and percentages are clamped to `0..100`;
- every populated level terminates in exactly one milestone;
- maximum progress/competency totals equal their stage/unit-set aggregates;
- remap replacement is atomic, so clients never load a partially rebuilt map.

Historical topology documents are not retained. Build and validate the complete
replacement in memory, then atomically replace/upsert the single field document.
Store `schemaVersion`, a deterministic `topologyVersion` or content hash, and
`generatedAt` on that document. The version identifies cache validity, not a
second historical record.

Stable entry ids derive from canonical topology, for example field + level +
ordered stage/milestone identity; finalize the exact collision-safe formula in
Phase 0 and keep it independent of render order changes that do not change the
logical entry. Split cache keys by responsibility:

- topology: field + topology version + schema version;
- learner state: account + field + learner-state version;
- derived geometry: topology version + width class.

The server or shared adapter derives:

- `completed`: all required work for the stage is complete;
- `current`: contains the most recently active/resumable unit set;
- `incomplete`: not all stage work is complete.

All stages are available and revisitable in the initial release. `session.start`
must still verify that the selected Field, topology, Stage, and UnitSet belong
together, but it must not reject a valid selection because an earlier Stage is
incomplete.

Choose the initial map anchor deterministically:

1. the last active Stage when it is incomplete;
2. otherwise the next incomplete Stage in journey order;
3. if every Stage is complete, the map start/first Stage fallback.

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
not tens of thousands, of entries. Record maximum node count, initial render
time, resize work, and input latency for a production-sized fixture on the
representative device/browser. These are smoke-regression measurements during
migration, not numerical release budgets; a later optimization project may set
stable budgets after the UI architecture settles.

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

Only introduce windowed SVG rendering if profiling demonstrates an actual
usability problem. If required, window complete level-sized SVG groups with
overscan, retain stable spacers/viewBox coordinates, and never unmount the
focused/current stage.
Browser `content-visibility` may be evaluated for surrounding HTML regions but
must not be assumed to optimize SVG internals.

#### 4.4.7 Accessibility and interaction

SVG appearance is not the only interface. Provide equivalent semantic
navigation:

- each selectable stage is keyboard-focusable with button semantics, an
  accessible name, state description, and Enter/Space activation;
- arrow-key navigation follows journey order; Home/End move to start/current
  endpoints where appropriate;
- every stage is keyboard-selectable, including completed stages being revisited;
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
- disconnected while topology/progress requires the server;
- session-start failure;
- topology updated while the learner is viewing the map.

Use the split cache keys defined in section 4.4.1. Static topology may be shared
across accounts; progress, current position, and sessions must never be. After a
successful unit/session update, refresh the learner-state layer and preserve the
selected/current stage and scroll anchor.

A remap builds and validates the complete topology in memory, then atomically
replaces/upserts the one map document for the field. Clients seeing a different
topology version invalidate derived geometry and icon caches, rebuild once, then
restore focus/scroll by stable entry id. No historical topology collection or
active-version pointer is introduced.

#### 4.4.9 Map-specific verification

Cover at least:

- server remap invariants, atomic replacement, deterministic ordering, and
  missing TestCycle/UnitSet/Unit failures;
- view-model layout for empty, single-stage, uneven-dimension, multi-level, and
  large maps;
- percentage clamping and zero/missing progress;
- start/stage/milestone/finish connector continuity at narrow and wide widths;
- completed/current/incomplete states and unrestricted valid Stage selection;
- active-incomplete/next-incomplete anchor ordering and preservation after
  refresh/resize;
- keyboard, pointer, touch, screen-reader, TTS, zoom, reduced-motion, forced
  colors, and HTML fallback behavior;
- observer cleanup and repeated route entry under Blaze HMR;
- disconnected-state behavior and topology-version invalidation after reconnect;
- recorded smoke-performance measurements on a production-sized map and the
  representative device/browser, without numerical release thresholds;
- screenshot/visual-regression fixtures for representative maps.

Gate the map migration on a side-by-side product review against the mobile map,
not against otu.lea's overview. This is a product-review checkpoint; later work
may proceed provisionally while its result is pending.

### 4.5 Session, response, and progress contract

Expose one explicit, versioned session API rather than relying on ambiguous
get-or-create behavior:

- `session.start({ fieldId, unitSetId, topologyVersion })` creates a new run or
  returns the existing incomplete run according to the UnitSet-repeat policy;
- `session.resume({ sessionId })` returns the owned authoritative state without
  advancing it;
- `session.advance({ sessionId, expectedUnitId, transitionId })` durably records
  the guarded story/unit transition exactly once;
- `session.restart({ unitSetId, transitionId })` deliberately starts a new
  UnitSet performance after a prior completed performance.

All methods derive `userId`, Dimension, Unit ordering, page count, item types,
and canonical content relationships on the server. Exact success DTOs, stable
`Meteor.Error` codes, ownership rules, availability checks, and idempotency
behavior are fixed in Phase 0. No deprecated mobile method compatibility layer
is required: the mobile client will be removed from distribution when the PWA is
production-ready. Remove obsolete endpoints once no current web path imports or
calls them.

Progress and competency achievement are separate aggregates:

- one progress unit is one completed page, independent of correctness;
- Unit maximum progress is `unit.pages.length`;
- UnitSet maximum progress is the sum of its Unit page counts;
- active UnitSet progress is the completed-page count represented by completed
  Units; aborting may therefore leave partial UnitSet progress, and resume starts
  after the last completed Unit;
- overall/milestone progress is the sum of effective UnitSet progress;
- maximum achievable competencies is the count of scoring occurrences, not the
  count of unique competency ids;
- achieved competencies is the count of matched scoring occurrences;
- competency percentage is `matchedScoringOccurrences /
  maxScoringOccurrences`, with an explicit zero-denominator result.

Items have no immediate retry loop. A learner repeats the UnitSet instead. A
new UnitSet performance supersedes the previous effective performance for
responses, scoring-occurrence totals, and competency percentage—even when the
new result is lower. It does not add a second copy to longitudinal aggregates.
Already completed Units/pages remain completed for progress purposes; the
restart/resume contract must define and test how an interrupted repeat continues
without double-counting. Persist enough run identity/history for idempotency and
audit as required, but expose exactly one effective performance per learner and
UnitSet to Progress, Map, and Achievements.

Phase 0 must publish a versioned response contract containing:

- renderer-specific raw-response unions for choice, cloze, connect, highlight,
  and sort;
- a truth table preserving entered, absent, explicit `null`, empty, and
  `__undefined__` from renderer through cache, method, Mongo, and scoring;
- the logical response key and replacement rule within a UnitSet performance;
- exact method success DTOs and stable error codes.

Scoring may normalize equivalent empty values internally, but persistence must
retain the original state. The framework-neutral normalizer and canonical
corelib scoring adapter are implemented once in Phase 2 for both server
persistence and later Blaze feedback integration.

### 4.6 Immediate-feedback contract

Define one canonical adapter between task renderers and scoring:

1. An item renderer reports normalized responses through `onInput`.
2. The page cache stores raw responses keyed by session, unit, page, and item.
3. On learner evaluation, the adapter locates the canonical content element and
   invokes corelib scoring.
4. The renderer displays item-level correct/incorrect/undefined feedback and
   reveals the correct answer, with optional sound, without exposing diagnostic
   competency details.
5. Raw responses are submitted to the server; the server scores or verifies
   them and persists a canonical response document.
6. Page/session advancement occurs only after a successful durable server
   submission; the migration does not provide an offline response outbox.

Items cannot be retried immediately; repetition occurs at UnitSet scope under
section 4.5. Submitting the current page for checking immediately displays its
correct answer, matching the mobile behavior.

### 4.7 PWA/offline boundary

First-release scope is an installable, reconnecting PWA that caches only the
application shell and immutable static assets. It shows connection state and
recovers safely after reconnect. Units, authenticated content, response
submission, Session advancement, and completion are not promised offline.

Full offline learning, durable response outbox/replay, versioned learning-content
caches, account-persistence warnings, storage lifecycle, logout/account-switch
partitioning, and cache eviction belong to the post-migration
`offline-and-client-data-management.md` plan.

Do not let the service worker cache DDP/SockJS traffic or authenticated dynamic
responses as generic assets. Treat cached learner data as sensitive local data
and clear or partition it by anonymous account.

## 5. Implementation phases

Each phase ends with a typed gate:

- **automated**: required checks pass;
- **reviewer**: independent code/plan review accepts the implementation;
- **product**: product owner validates learner-facing behavior;
- **operational**: a manual rollout or production procedure is completed.

Automated and reviewer gates are hard implementation gates. Product and
operational gates are not unattended-agent gates: later work may proceed
provisionally while they are pending, provided the parent reports the result as
`ready_for_product_approval` or `ready_for_operational_validation` and does not
claim the dependent release criterion is complete.

### Phase 0: lock the behavioral contract

Deliverables:

- Convert the workflow map above into acceptance scenarios using mobile screen
  behavior and representative production-like content fixtures.
- Produce a legacy-evidence matrix for each scenario with: learner-visible invariant, supporting
  guide/diagram/API/source/test, current `src` behavior, intended migration disposition, and any
  contradiction. Mark each entry `preserve`, `adapt`, `repair`, `defer`, or `reject`.
- Inventory all mobile item subtypes, instruction variants, media types, TTS
  behavior, empty-page behavior, and accessibility interactions.
- Explicitly cover zero-, one-, and multi-item pages; new/resumed story state; field/stage/dimension/
  unit-set selection; completion/appraisal; and profile/achievement/account paths.
- Inventory the two sync layers separately: content-service-to-backend import/remap and
  backend-to-client reference caching. Inventory learner-data persistence as a third, independent
  durability path.
- Capture acceptance scenarios proving that an unsynchronized `lea.content` edit is invisible to
  learners, an explicitly promoted snapshot becomes visible with matching derived map/achievement
  data, and a failed import/remap retains the last known-good snapshot and versions.
- Publish the versioned session/response contract from section 4.5, including
  response-state truth table, subtype payload matrix, UnitSet replacement
  semantics, progress formulas, success DTOs, and stable error codes.
- Record answer reveal on page checking in the parity scenarios.
- Record the first-release offline boundary as static application-shell/assets
  caching plus reconnect behavior only.
- Capture a minimal golden learning journey: register/restore, choose field,
  choose unit set, story, every item subtype, immediate feedback, resume,
  complete, and see updated progress.

Gate (**product**, provisional): product owner approves the parity checklist,
including answer reveal on page submission. Contract completeness is also checked by a
**reviewer** before Phase 2 implements it.

### Phase 1: establish a trusted test and package baseline

Deliverables:

- Add/normalize `src/package.json` scripts that invoke the repository's
  `src/test.sh` entry point, including explicit `test:server`, `test:client`, and
  `test:all` commands/flags, without replacing the Meteor test runner.
- Run lint and existing server/client tests; classify failures as pre-existing,
  environment-specific, or migration blockers.
- Ensure client tests actually connect to a browser runner; a server-only green
  run is not sufficient.
- Add Playwright as the authorized browser E2E runner and require a positive
  browser-connected assertion. Keep migration E2E coverage workflow-focused;
  prefer unit and Meteor integration tests for exhaustive contract cases.
- Document the location and review/approval process for the small set of
  representative Playwright screenshot baselines used by the map.
- Add contract tests for route argument construction, context method schemas,
  and representative shared-renderer payloads.
- Produce a Meteor-capability audit for Accounts, Methods, validation, rate limiting, connection
  state, pub/sub, Mongo indexes/atomicity, startup, autoupdate, and modules. Record the domain reason
  or missing capability for every retained custom mechanism.
- Pin or document all directly used Atmosphere packages. Replace prerelease
  packages only where a compatible stable release is proven; do not combine a
  broad dependency upgrade with workflow changes.
- Confirm the app stays on the Meteor bundler and retain nested-import support.
- Establish integration fixtures for backend startup synchronization without changing its
  operational activation: disabled sync retains the existing snapshot; enabled sync imports the
  selected complete collections; failure does not publish a partial/mixed snapshot.

Gate (**automated + reviewer**): repeatable lint/test commands and a documented baseline with no unknown
core-loop failures. The baseline must also demonstrate that normal learner content reads are served
from backend-local collections rather than proxied to live `lea.content` data.

### Phase 2: repair server contracts and ownership

Deliverables:

- Define canonical `Session` and `Response` method DTOs and remove field-name
  drift (`unit` versus `unitId`, unit-set identifiers, score types).
- Implement the explicit `start`, `resume`, `advance`, and `restart` session API
  from section 4.5 with ownership, content-relationship validation, unrestricted
  valid Stage access, and transition idempotency.
- Make response submission idempotent with a unique logical key such as
  `(userId, unitSetPerformanceId, unitId, page, itemId)` and a matching Mongo
  index; a repeated UnitSet creates the new superseding performance scope.
- Validate that session, unit set, unit, page, and item belong together before
  accepting a response.
- Implement the framework-neutral response normalizer and canonical corelib
  scoring adapter here, then use it to score/verify responses server-side.
- Implement page-based progress and scored-occurrence competency aggregation
  exactly as specified in section 4.5; repeating a UnitSet replaces, never adds
  to, its effective competency result.
- Make progress/session advancement atomic enough that retries cannot duplicate
  progress. If a Mongo transaction is not appropriate, use idempotent state
  transitions and guarded updates.
- Return intentional `Meteor.Error` codes suitable for learner-facing recovery.
- Audit all methods and any publications for authentication, field projection,
  argument checks, and rate limits.
- Remove deprecated mobile-only endpoints and payload compatibility after
  confirming the web path no longer imports/calls them. No legacy score-payload
  adapter is required. Preserve and migrate existing persisted learner data as
  required by the new web contracts; document indexes, backfill/duplicate
  handling, and rollback.

Gate (**automated + reviewer**): method integration tests prove cross-user isolation, validation,
idempotent retry, correct scoring, and no advancement after rejected writes.

### Phase 3: stabilize navigation, loading, and session recovery

Deliverables:

- Define a single route parameter contract for overview -> map -> story -> unit
  -> completion and back/exit paths.
- Extract a plain-JavaScript session transition function and test all states:
  new session with/without story, resumed page, next unit, next unit set,
  completed session, stale URL, deleted content, and signed-out user.
- Model story, current Unit, next Unit, page, and completion explicitly. Do not reproduce the legacy
  local-session restoration bug or treat route/local-cache state as server authority.
- Replace overlapping async autorun work with a generation token or serialized
  loader so stale requests cannot overwrite the latest route state.
- Give every page explicit loading, empty, recoverable error, fatal error, and
  reconnecting states.
- Scope caches by user/session and clean them only after confirmed persistence.
- Remove debugger statements and placeholder failure branches from the core
  path.

Gate (**automated + reviewer**): refresh, browser back/forward, duplicate click, disconnect/reconnect, and
stale deep-link tests all converge on the correct session state.

### Phase 4: implement the learner SVG map

Deliverables:

- version and validate the server-generated map topology and make remap
  replacement of the single per-field document atomic; do not retain historical
  topology documents;
- generate and promote topology only from the backend's imported production snapshot; never remap
  learner-visible topology from live/request-time content-service reads;
- replace random/current card view ids with stable topology-derived entry ids;
- implement and unit-test the immutable map view-model/layout adapter;
- build the responsive SVG scene and accessible HTML stage chooser using the
  component boundaries in section 4.4;
- merge learner progress without mutating cached topology or leaking state
  across accounts;
- implement completed/current/incomplete states with every valid Stage
  selectable and revisitable;
- implement the active-incomplete then next-incomplete anchor rule and preserve
  it after load, resize, progress refresh, reconnect, and topology update;
- add responsive, accessibility, observer-cleanup, representative Playwright
  screenshot, and production-sized smoke-performance coverage; record timings
  for regression visibility without introducing numerical release budgets in
  this migration;
- retain the current card/list representation only as the no-SVG fallback until
  the accessible structured fallback is complete.

Gate (**automated + reviewer**, plus **product** provisional): side-by-side product review confirms parity with the mobile journey map,
all stage-to-dimension-to-unit-set navigation works, accessibility checks pass,
and smoke profiling shows no severe interaction/rendering regression on the
agreed representative browser/device.

### Phase 5: complete renderer parity and immediate feedback

Deliverables:

- Integrate the Phase 2 canonical scoring adapter into the feedback contract in
  section 4.6, based on otu.lea internal's proven callback shape but owned by
  lea.app; do not create a second scoring implementation.
- Verify choice, cloze text/select, connect, highlight, and sort against shared/mobile
  scoring fixtures, including absent, null, empty, undefined/skipped, repeated,
  and malformed responses.
- Treat sort as release-supported but allow renderer-specific hardening that is
  not needed for workflow parity to be recorded as post-migration follow-up.
- Preserve mobile instruction variants, story/media rendering, Markdown, image
  behavior, and TTS.
- Add accessible status text and live-region behavior in addition to color and
  sound. Respect reduced-motion and sound preferences.
- Prevent navigation while evaluation/submission is unresolved; provide a clear
  retry path on network or validation failure.
- Keep competency identifiers and diagnostic grading out of immediate learner
  feedback unless explicitly approved.

Gate (**automated + reviewer**): the golden journey passes for every item subtype on keyboard, touch, and
  representative narrow/wide viewports, with identical client/server scoring.

### Phase 6: complete learner workflow and secondary features

Deliverables:

- Integrate and regression-test the Phase 4 map with field/dimension/level and
  end-to-end learning navigation; Phase 4 remains authoritative for map
  current/completion, unrestricted access, revisit, and anchor semantics.
- Replace the diagnostic-derived completion page with learner-oriented summary,
  motivational feedback, achievements, and next-step actions.
- Preserve the optional completion appraisal as feedback independent of score/progress, if retained
  by Phase 0; failure to send it must not invalidate completed learning work.
- Port every profile, achievement, TTS, account/recovery, deletion, and legal
  screen/flow that was part of the mobile app. None is optional for first release.
- Confirm analytics/error logging remains anonymous and avoids raw learner
  responses or restore credentials.
- Remove or clearly isolate transitional pages (`home`, duplicate login paths,
  debug-only contexts) once no route imports them.

Gate (**automated + reviewer**, plus **product** provisional): approved mobile parity checklist passes, excluding documented mobile-only
hardware behavior.

### Phase 7: PWA hardening

Deliverables:

- Correct manifest name, description, theme, icons, start URL, and install
  behavior for lea.app.
- Replace the inherited service-worker behavior with a versioned, tested cache
  policy for shell and immutable build assets.
- Add an update-available flow so active learner work is not destroyed by an
  uncontrolled service-worker activation. Integrate `autoupdate`/WebApp update notification with
  service-worker activation instead of polling bundle versions separately.
- Add online/reconnecting/offline UI driven primarily by reactive `Meteor.status()` and test
  `Meteor.reconnect()`/`DDP.onReconnect` plus SockJS/DDP cache exclusion explicitly.
- Do not cache learning content or implement response outbox/replay. Link the
  deferred `offline-and-client-data-management.md` plan from release docs.
- Test static-cache update behavior and app update during an active online unit.

Gate (**automated + reviewer**): installability and cache behavior pass browser audits and manual tests;
no stale bundle or cross-account learner data survives the defined cleanup
rules.

### Phase 8: whole-application audit, compatibility, and release readiness

Deliverables:

- Audit—not defer—the accessibility already implemented in earlier phases:
  keyboard, focus-order, screen-reader announcement, contrast, zoom,
  reduced-motion, and touch-target checks with special attention to all item
  renderers. These functional requirements are the migration accessibility
  target; no additional legacy-browser or named conformance-level target is
  introduced by this plan.
- Test the latest stable major modern browsers: Chrome/Chromium (including
  Edge), Firefox, and Safari on desktop, plus current iOS Safari and Android
  Chrome in browser and installed-PWA modes where installation is supported.
  Internet Explorer is explicitly unsupported.
- Add browser E2E coverage for one full successful learning loop and rejected,
  disconnect/reconnect, restore-account, and resume-after-refresh paths.
- Measure initial bundle, route-load time, media behavior, and slow-network
  usability; lazy-load route-specific code without moving to Rspack.
- Document rollout, telemetry, rollback, removal of the mobile apps from their
  stores when the PWA is production-ready, and removal of obsolete mobile-only
  backend endpoints. No concurrent mobile-backend compatibility period is required.
- Update the root `README.md` and active development documentation so they
  describe the Meteor/Blaze PWA rather than the deprecated React Native client.
- Document the production content-promotion runbook: enable selected startup sync, validate import
  and derived read models, verify client-visible versions, disable sync, and recover to the last
  known-good snapshot on failure.
- Run a staged pilot before broad release.

Gate (**automated + reviewer + product + operational**): all release criteria
are green, the PWA is production-ready, mobile store removal is scheduled, and
obsolete mobile-only endpoints have an approved removal/rollback procedure.

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
  reconnect, duplicate actions, and static service-worker updates using Playwright. Keep the
  migration suite focused on critical workflows rather than exhaustive visual
  or renderer permutations.
- Authentication E2E: anonymous code registration/login, same-browser resume,
  restore-code recovery, logout, and account deletion. Extended authentication
  modes are tested by their separate plan.
- Map tests: remap and DTO integrity, deterministic view-model geometry, SVG
  continuity and states, stage chooser/session enforcement, responsive resize,
  current-position restoration, accessibility, visual regression, and
  smoke performance measurements without numerical migration release budgets.
- Manual exploratory checks: TTS voices, touch interactions, installed PWA,
  reconnect behavior, assistive technology, and content/media edge cases.

Do not mock Mongo for server contract tests. Do not consider tests complete if
the browser suite did not connect.

## 7. Review checkpoints and recommended pull-request sequence

Keep changes small and independently reviewable:

1. Behavioral contract and regression fixtures.
2. Test harness/baseline only.
3. Response/session server contracts and migrations/indexes.
4. Route/session state stabilization.
5. Server map DTO/remap contract, SVG map/view model, and provisional mobile
   parity gate.
6. Immediate-feedback integration and one item subtype.
7. Remaining item subtypes, including sort, and accessibility.
8. Completion, progress, profile, and achievements.
9. Manifest/service worker static-cache and reconnect behavior.
10. Whole-application audit and release documentation.

Avoid mixing package upgrades, data migrations, server contracts, and visual
redesign in one pull request.

## 8. Decision status and deferred specifications

All migration questions raised by the review have been incorporated into this
plan. There are no remaining review decisions blocking implementation.

The following separately planned work is explicitly not part of migration:

- passwordless email, QR, Google/OAuth, account merge, and extended credential
  lifecycle: `02_extended-authentication.md`;
- full offline learning, durable response outbox/replay, learning-content cache,
  browser-account persistence warnings, storage partitioning, and client-data
  lifecycle: `03_offline-and-client-data-management.md`.

## 9. Definition of migration complete

The migration is complete when:

- all approved mobile learner workflows work in the Blaze PWA;
- every supported item subtype gives immediate, accessible feedback and client
  and server scores agree, revealing the correct answer on page submission;
- anonymous code registration/login, restore-code recovery, logout, deletion,
  and browser-session resume are reliable;
- responses and progress are durable, owner-scoped, idempotent, and safely
  recover after reconnect; offline learning completion is not required;
- the SVG learner map preserves the mobile spatial journey, progress,
  competency indicators, current position, and allowed next destinations;
- otu.lea diagnostic behavior is absent from the learner product;
- installability, static application-shell/asset caching, and reconnect behavior
  work on the latest stable supported modern browsers; Internet Explorer is unsupported;
- lint, unit, Meteor integration, client, and E2E suites pass;
- no migration-blocking debugger/TODO/placeholder path remains;
- every mobile profile/achievement/account/TTS/legal screen is present;
- all valid Stages are selectable/revisitable and the map uses the approved
  active-incomplete/next-incomplete anchor rule;
- mobile store removal and obsolete endpoint removal/rollback procedures are documented;
- the app remains on Meteor 3.4 + Blaze + the Meteor bundler unless a later,
  separately reviewed plan changes that baseline.

## 10. Technical references

- Meteor application structure: https://docs.meteor.com/tutorials/application-structure/
- Meteor Blaze tutorial (includes Meteor-bundler example):
  https://docs.meteor.com/tutorials/blaze/
- Meteor accounts: https://docs.meteor.com/tutorials/accounts/accounts
- Meteor accounts API (storage and HttpOnly-cookie behavior):
  https://release-3-4-0.docs-online.meteor.com/api/accounts
- Pinned Meteor 3.4 API index (Methods, pub/sub, connections, Mongo, Tracker, validation, rate
  limiting, startup, EJSON): https://release-3-4-0.docs-online.meteor.com/api/
- Pinned maintained-package index (`audit-argument-checks`, `autoupdate`, modules and related
  packages): https://release-3-4-0.docs-online.meteor.com/api/#packages
- Blaze template lifecycle: https://www.blazejs.org/api/templates.html
- Blaze reusable components:
  https://www.blazejs.org/guide/reusable-components.html
- Local domain definition: `DOMAIN.md`
- Existing workflow/sync notes: `docs/guide/APP_FLOW.md`,
  `docs/guide/APP_CONNECTION.md`, `docs/guide/APP_SYNC.md`,
  `docs/guide/BACKEND_SYNC.md`, and `docs/guide/BACKEND_REMAP.md`
- Historical workflow diagrams: `docs/arch/application-flow.graphml` and
  `docs/arch/auth-workflow.graphml`
- Generated legacy API snapshots: `docs/api/app` and `docs/api/backend` (evidence only)
- Separate authentication work: `docs/plans/02_extended-authentication.md`
- Deferred offline/client-data work:
  `docs/plans/03_offline-and-client-data-management.md`
