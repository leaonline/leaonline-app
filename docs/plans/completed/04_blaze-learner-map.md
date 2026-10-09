# Blaze learner-map development plan

Status: implementation plan with integrated product decisions and remaining clarifications.

Date: 2026-10-08

## 1. Objective and scope

Replace the default preliminary list in `src/ui/pages/map/map.js` and `map.html`
with the mobile journey map using Meteor 3, Blaze, native SVG, and Bootstrap 5.3.
Keep the list as both a rendering-error fallback and an explicitly selectable
alternative. Do not persist the view preference.

Preserve Field → Stage → Dimension/UnitSet → Session navigation. Stage selection
opens a modal on every screen size; explicit UnitSet selection enters the existing
Session flow. Every valid stage remains selectable.

The recorded product decisions below override conflicting proposals in the
previous revision and the broader [migration plan, section 4.4](01_mobile-to-blaze-pwa-migration.md#44-learner-map-svg-implementation)
for this implementation. [DOMAIN.md](../../DOMAIN.md) remains the domain reference.
This slice accepts current backend data rather than requiring the parent plan's
DTO/server redesign first. Follow TDD: failing behavioral test, smallest passing
implementation, then refactoring. This document remains a plan.

### Recorded product decisions — 2026-10-08

This register incorporates all 24 implementation-question answers. Accepted
proposals are written as requirements; unanswered parts remain investigations
or bounded clarifications in section 9, not confirmed decisions. Phase references
identify when a detail is needed, not a blocker for all work.

| Topic | Binding decision |
| --- | --- |
| Backend prerequisites | Treat backend MapData and MapIcons as authoritative for this implementation. Icons are intended to sync from content into MapIcons; add the missing `loadContentDoc` integration. Document misconceptions/conflicts as comments for future work. |
| Existing data and rollout | Expect a map for every selectable field: editors must ensure its map is synchronized from content before making the field selectable. |
| Representative fixtures | Use the supplied real-world mobile [map](map-example.json) and [progress](progress-example.json) data. Maximum production sizes were not specified. |
| Stable identity | Remapping after deployment is a rare exception. Prefer creating new fields or updating UnitSets over changing map structure; derive presentation identities within that fixed-topology assumption. |
| Content edge cases | Use the supplied examples as evidence for actual content shapes. The answer did not approve new universal validation rules for sparse combinations, zero competencies, broken references, or page maxima. |
| Initial anchor | Prefer a current started, incomplete Session's stage; otherwise the last active incomplete UnitSet in Progress; otherwise the last completed UnitSet. If that stage is fully complete, consider the next stage. If nothing is found, use the first stage. Section 5 specifies the remaining ordering questions. |
| Next incomplete stage | When the last active stage is complete, search backward for an incomplete stage. Keep the first-stage fallback when all are complete; the search boundary remains to be resolved with the next-stage rule. |
| Repeated work | New attempts hard-override prior attempts in persisted Progress. Display the returned projection without retaining or merging previous results locally. |
| Chooser presentation | Clicking a stage opens a modal to view and select its UnitSets on every screen size. |
| URL and history | An explicit stable stage hint opens the chooser; Back closes it. No URL automatically starts a Session. A valid existing `?unitSet=` hint resolves the stage and opens its chooser. |
| Return precedence | Explicit valid URL hint → same-account/field return position → automatic anchor. |
| Partial failure | If topology is valid but Progress/current-Session loading fails, show learner state as unavailable with retry. Allow explicit online selection, subject to a successful authoritative Session request. |
| Refresh timing | Defer refresh-policy work to the PWA plan; leave a source comment for later implementation. |
| Removed content | Treat deployed maps as topologically fixed; removal/remap recovery is outside this slice. |
| Legacy visual conflicts | Accept executable mobile diamond-fill correction, a separate finish after the final milestone, and every offered dimension rather than a four-slot limit. |
| Progress and competencies | Show graphical page progress only through stage-circle border fill; fill diamonds for competencies. Do not add the proposed milestone page-progress text. |
| Dimension slots and stage states | Keep dimension positions fixed across the map with neutral space for absent dimensions; a one-dimension stage draws one diamond in its shared position. Completed stages have a full border and success background; current stages use primary. Selection opens the modal and adds a shadow; closing retains current state and removes selection. |
| Supported environments | Stretch horizontal stage spacing to the container width, starting at mobile viewports. Support current major browsers without a backward-compatibility layer and expose stages as selectable to screen readers. TTS is excluded. |
| Accessibility sizing and theme | No new touch-target, font-size, contrast, or desktop-width specification is required now. Use the Bootstrap 5.3 color theme. |
| Copy and languages | Reuse mobile labels through `{{i18n 'map.someLabel'}}` and existing translations. No TTS in this map version; no additional language set or spoken-copy review was specified. |
| Browser test infrastructure | The supplied setup is reported to have dependencies in `package.json` and headless Puppeteer configured by `test.sh`. Reuse the added [Blaze/test helpers](../../src/tests/helpers/); reconcile actual client execution in Phase 0 as described in section 6. |
| Icons and assets | Use the configured assets available through MapData/MapIcons. Do not invent icon fallbacks; editors must correct missing MapData configuration. |
| List alternative | Use the existing list when rendering errors prevent the map, and offer explicit list selection as an alternative. Do not save the preference. |
| Review evidence | Store temporary screenshots, manual results, and performance observations in this repository's `docs/plans`. No hard performance limits or premature optimization; a final reviewer was not named. |

Out of scope: backend topology/validation redesign, DTO versioning, content
promotion changes, historical topology, removal/remap recovery, new refresh
policies, persistent preferences, TTS additions, older-browser compatibility,
offline learning, scoring changes, bundler/framework migration, and premature
optimization. Document backend misconceptions/conflicts as source comments for
future work rather than silently repairing their semantics in this UI task.

## 2. Evidence and supplied fixtures

Use `deprecated/app/lib/screens/map/MapScreen.js`, `loadMapData.js`,
`DimensionScreen.js`, and `components/{Stage,Milestone,Connector,Finish}.js`.
Translate behavior, not React Native hooks, FlatList, vibration, or mutable caches.
Visual references are `docs/arch/screens/03-map-screen-01-overview.png` and
`03-map-screen-02-dimension-select.png`.

[map-example.json](map-example.json) contains 39 stages and five milestones
across five levels. It declares five dimensions, but offered UnitSets use only
indexes 1–4; stages offer between one and four UnitSets. No offered UnitSet in
this sample has zero attainable competencies. These observations support sparse
layout; they do not prove universal data-validation rules.

[progress-example.json](progress-example.json) completes the four UnitSets in
stage 1 and ends with an incomplete UnitSet in stage 2 with zero page and
competency progress. Without a current Session, the expected anchor is stage 2.
Filtering for nonzero progress would be incorrect.

Keep these examples unchanged and derive small test fixtures. Resolve dimension
titles/icons/colors and level labels from existing contexts; complete dimension,
level, Session, and MapIcons records are not included in the examples.

Current prototype gaps remain: random render IDs, fractions rendered as
percentages, incomplete geometry/milestone/current-state modeling, and a
hard-coded zero competency count. Dependency readiness in `createTemplate`
also precedes asynchronous page loading; the map needs explicit data readiness.

## 3. Data boundaries and component design

### Existing backend contracts

Reuse `createTemplate`, instance state, context/collection factories,
`loadContentDoc`, `loadAllContentDocs`, `callMethod`, and existing routing.
Load Field, MapData, MapIcons, Dimension, Level, and Progress through the existing
backend/local-collection boundary. Add the missing MapIcons load; its data is
already intended to be synchronized from content into the backend collection.

Trace field-to-icon-document resolution before wiring `loadContentDoc`: the
inspected MapIcons getter accepts `_id`, while configuration uses `fieldId`.
Do not assume these identifiers are interchangeable or expose the administrative
`getAll` method. Locate the existing read integration, or document its precise
gap before dependent implementation. This is not a general API redesign.

Read current Session state from the existing account-scoped flow. Loading the
map or chooser must not invoke a Session-creating method. Verify that an existing
nonmutating source supplies this state; document any missing contract rather than
silently introduce the previously proposed Session-summary infrastructure.

No schemaVersion/generatedAt additions, remap migration, new promotion validator,
or compatibility rollout are prerequisites. Editors ensure selectable fields
have maps. Unexpected missing data still needs a clear error, not a crash.

Derive stable presentation IDs locally from field, level, entry type, and
dimension/UnitSet membership. Do not add backend fields or random render IDs.
Scope SVG resource IDs per mounted instance. Treat topology as fixed; membership
changes are not a supported routine navigation-recovery workflow.

Keep learner projections and return state scoped by account and field. Never
mutate shared topology with learner data. No new durable browser cache, content
hash ledger, publication, or refresh service.

### Pure view model

Replace `postProcessMap` with a framework-neutral adapter beside the page.
Pass topology, resolved dimensions/levels, configured icons, current Session,
Progress, and layout options explicitly. Return immutable records for stable
IDs, stage numbering, choices, coordinates/connectors, progress, competency
indicators, UI state, accessible descriptions, and anchor ID. Keep geometry
reusable independently of learner changes and translate labels in templates.

Page percentage is `100 * current / max`, bounded to 0–100 for display.
Completion follows authoritative `complete` flags, not rounded percentages.
Keep competency values separate. Zero/nonfinite denominators must not yield
invalid SVG: use unavailable/not-applicable presentation and document unexpected
data without inventing a backend content rule.

Missing Progress entries mean no recorded work; failed reads mean unavailable
information, not zero. Render current returned Progress: new attempts override
prior attempts, with no local best-score retention or merging. Do not change
Progress persistence in this map task.

| Component | Responsibility |
| --- | --- |
| `map` | Existing route template; data readiness/errors, mode selection, Session orchestration. |
| `learnerMap` | Responsive SVG, scroll/focus, keyboard navigation, layout lifecycle. |
| `mapStage` | Stage number, page-progress border, fixed-position competency diamonds, state styling. |
| `mapMilestone` | Recognizable level diamond/stars; no added page-progress text or gauge. |
| Connectors and markers | Continuous route, configured decoration, start and separate finish. |
| `mapStageChooser` | HTML modal outside SVG, choices, busy/errors, continue/restart integration. |
| List view | Existing list adapted to the same model, truthful progress, and Session callbacks. |

Use native SVG paths/circles/polygons and trusted bundled assets; no raw
backend-string HTML/SVG injection. Render the configured names/references from
MapData/MapIcons. Do not invent substitute icons or silently guess alternative
configuration. Missing required configuration is an editorial issue to report.
List fallback may expose valid choices when the scene cannot render, but cannot
repair absent topology.

## 4. Visual and accessible interaction

- Bottom-to-top journey, first stage on the right, alternating placement,
  continuous connectors, level milestones, start, and a separate finish marker.
- Horizontal gaps stretch to the Bootstrap container width, including desktop.
  Remove the earlier additional journey-width cap. Keep mobile stages usable
  and recompute geometry when container width changes.
- Bootstrap 5.3 theme: completed stage has a fully filled border and
  `bg-success`; current stage has `bg-primary`. Selection adds a shadow while
  its modal is open. Closing removes the shadow but retains the stage as the
  current UI stage; this does not change Session or Progress.
- Keep automatic learning anchor, current UI stage, modal selection, and
  completion separate. Proposed precedence when a completed stage is current:
  primary background, full progress border, and an accessible completed
  description. Confirm this overlap during fixture/visual review.
- Graphical page progress appears only in stage-circle border fill.
  Competencies appear in diamonds. No new milestone percentage text, extra
  progress gauge, or completion-check icon. Accessible descriptions may expose
  exact values without adding competing visual gauges.
- Preserve executable mobile diamond correction: positive fractions below .30
  display as .30; values above .75 and below .90 display as .75; .90 and above
  display full. Do not change actual counts or accessible percentages.
- Fixed diamond slots follow the canonical order of dimensions offered anywhere
  in the map. The supplied sample therefore has four active slots, despite five
  metadata dimensions. Reserve neutral empty space for absent stage dimensions;
  draw only offered diamonds. This interprets the fixed-slot decision's placeholder requirement in
  light of its explicit “one dimension → one diamond” example. Never compact or
  recenter sparse stages. Render five slots if five dimensions are actually offered.
- Use mobile labels via `{{i18n 'map.someLabel'}}` and existing translation modules.
  No TTS additions or TTS acceptance criteria for this version.

Provide selectable button semantics for screen readers, accessible names, visible
focus, Enter/Space activation, and logical journey-order keyboard navigation.
Modal focus enters on opening and returns to its stage on closing. Escape and
browser Back close it. Avoid competing traps with the existing decision modal.

Preserve zoom and reduced-motion usability. Support current major browsers;
do not build an older-browser compatibility layer. No new formal touch-target,
font-size, or contrast specification is a prerequisite; use the existing theme.

## 5. Anchor, navigation, and failure rules

### Automatic anchor

1. Find the stage of a current started but incomplete Session.
2. Without one, find the last active incomplete UnitSet in Progress, including
   a zero-progress entry with `complete: false`, and pin its stage.
3. Otherwise find the last completed UnitSet and pin its stage.
4. If all offered UnitSets in that stage are complete, consider the next stage
   in journey order, skipping milestones/markers.
5. Apply the agreed backward search for an incomplete stage when the completed-stage
   case still needs an incomplete destination.
6. If no usable candidate exists, pin the first stage. If all stages are
   complete, use the first-stage fallback. Empty topology has no anchor.

The backward direction is settled, but the recorded decisions do not specify the
search start or wrap boundary relative to the immediate-next-stage rule. Resolve this with
concrete out-of-order completion cases before finalizing anchor tests. Working
interpretation: use the immediate next stage if incomplete; otherwise search
backward from the journey end for the last incomplete stage; all-complete returns
to stage 1. This interpretation is not a confirmed product answer.

Use the existing definition of current Session and verify how Progress ordering
indicates last activity. Do not fabricate timestamps or modify persistence to
impose ordering. The supplied example fixes one expected anchor, not every
multiple-Session or out-of-order case.

### Routing and Session selection

Precedence: explicit valid URL hint → same-account/field return position →
automatic anchor. A stable stage hint opens the modal. A valid `?unitSet=` hint
resolves its stage and opens the chooser without starting a Session. Browser
Back closes the modal before leaving the field; invalid hints yield safe map
state. Use the existing router; URL state never authorizes work.

Keep `onSelected({sessionId, unitSetId, unitId, showStory})` compatible with
`Routes.map`. Only explicit UnitSet selection invokes Session lookup/start.
Reuse new-session, continue, restart, cancel, and story/no-story behavior based
on returned documents. Keep busy state through lookup, decisions, restart, and
navigation to prevent duplicate actions.

### Loading, list mode, and refresh scope

Distinguish topology loading, learner-state loading, ready, empty/error, and
Session failure. Valid topology remains visible when Progress fails; show
unavailable status and retry. Allow explicit online selection, with the
authoritative Session request determining success. Never present failed reads
as zero or disconnected requests as durable learning.

Offer a map/list toggle even without errors. Keep the choice transient, with no
storage persistence. If scene rendering fails and valid choices exist, show the
list with an explanation; preserve the same learner data and Session decisions.

Use current page loading and existing learning-return behavior. Do not add tab
visibility, cross-device polling, reconnect refresh orchestration, or topology
replacement recovery. Add a source comment that a refresh policy belongs to
future PWA work. Preserve focus/position on ordinary display updates and resize;
reject stale requests from another field/account or a destroyed instance.

## 6. Tests and supplied infrastructure

Reuse Meteor Mocha/Chai/Sinon, the supplied headless Puppeteer setup, and the added
helpers under `src/tests/helpers/`:

- `blazeHelpers.tests.js`: prefer `createTemplateRenderingContext`, which keeps
  the Blaze view, waits for Tracker, and removes it during teardown.
- `rendererHelpers.tests.js`: renderer context, Sinon sandbox, translated-label
  assertions, and bounded observable-state waiting.
- `createFakeIntersectionObserver.tests.js`: reuse if dependencies need it;
  do not add observers merely because a helper exists.

Do not replace the test framework or default to installing another browser tool.
Verify actual entry imports, client execution, and cleanup. The inspected local
`test.sh` still sets `T_CLIENT=0`, and `tests/main.js` does not import UI suites.
This differs from the reported working setup: reconcile the real invocation
in Phase 0 before claiming browser coverage. Installed Puppeteer alone does not
prove client assertions run. Register new suites through the existing test graph
as needed, without broadly repairing unrelated dormant tests.

Preserve `MapData.tests.js`, `runRemap.tests.js`, `MapIcons.tests.js`,
`Progress.tests.js`, and `Session.tests.js` as compatibility baselines. Extend
backend tests only for actual in-scope integration changes; do not add tests that
demand deferred DTO/remap work. Reuse loading/routing tests and add focused
pure-model and Blaze tests for the feature.

## 7. Ordered TDD phases

### Phase 0 — Integration and executable baseline

1. Record existing focused test results; verify the actual Puppeteer invocation
   and client assertion counts with the supplied helpers.
2. Trace MapIcons loading/lookup and nonmutating current-Session availability.
   Record missing read integration or backend misconceptions for later work;
   do not expand into server/schema redesign.
3. Derive fixtures from the supplied JSON. Resolve the anchor-search boundary
   and record explicit expectations for fixed slots and overlapping UI states.

Exit: browser assertions execute, available read inputs are understood, and
anchor cases are precise enough to test. No DTO migration prerequisite.

### Phase 1 — Pure model and anchor rules

**Red:** cover the real 39-stage/five-milestone map, with stage 2 as the supplied
Progress anchor absent a Session. Add current Session precedence, zero-progress
incomplete entries, last completed work, next-stage/backward search, no progress,
all complete, and empty/malformed presentation inputs. Test 1/4 → 25%, bounded
values, zero denominators, separate competencies, replacement attempts, stable
IDs, frozen inputs, and exact diamond-correction boundaries.

**Green/refactor:** implement the adapter, preserving backend meaning and all
canonical milestones; derive start and separate finish markers. No persistence
or backend validation changes.

### Phase 2 — Responsive SVG and stage interaction

**Red:** test bottom-to-top order, first-stage-right alternation, connector
continuity at mobile/tablet/desktop container widths, fixed dimension slots,
one-dimension stages retaining their position, and unique IDs across instances.
Cover ring/diamond separation, milestone artwork, configured icons, specified
state colors/shadow, screen-reader semantics, and keyboard activation.

**Green:** build templates and theme-based styles with gaps stretching to the
container. No extra desktop width cap, icon fallback, TTS, or milestone progress
gauge. Import through the existing lazy route.

**Red → green:** test resize, stable focus/scroll, initial anchor after layout,
and repeated render/remove cleanup. Scope DOM work to instances and dispose
observers, frames, and listeners; guard asynchronous results.

### Phase 3 — Modal, Session flow, and list alternative

**Red:** cover modal opening/closing, shadow removal with retained current UI
state, Back/Forward, valid/invalid stage and UnitSet hints, return precedence,
one/many choices, all valid stages, cancellation, and focus restoration.

**Red → green:** integrate Session behavior: story/no-story, continue, restart,
failure, double activation, and navigation away while pending. Assert callback
payloads and method counts; opening a map or chooser never creates a Session.

**Red → green:** implement explicit map/list switching and rendering-error
fallback. Both use the same model and decisions. Assert no preference storage,
truthful percentages/competencies, and preserved choices. Retain useful existing
list presentation without its hard-coded competency zero or fraction bug.

### Phase 4 — Failure states and live integration

**Red → green:** cover missing versus failed Progress reads, retry, selection
while learner state is unavailable, authoritative Session rejection, account
isolation, destroyed-instance guards, and return through the existing completion
flow. Render replacement-attempt Progress without retaining earlier local results.

Use existing loading/lifecycle behavior and add the deferred-refresh comment.
Do not implement new refresh triggers, remap recovery, or offline submission.
Report missing editorial configuration without substitute icons.

### Phase 5 — Browser and visual acceptance

Compare supplied-example rendering to mobile references: path, start/finish,
rings, diamonds, milestone stars, decoration, modal, and theme-based states.
Check current major browsers at mobile and wider container widths; verify
screen-reader selection, keyboard/focus, touch, zoom, resize, and reduced motion.
TTS is not part of acceptance.

Exercise Field → Stage → modal choice → new/resumed Session → completion → map,
plus a server-rejected action and manual/fallback list mode. Store temporary
screenshots, manual results, and observations in `docs/plans`. Observe practical
responsiveness with the real example; no hard budget or preemptive virtualization.
The final reviewer remains unnamed: record the review outcome when available
rather than implicitly claiming accepted parity.

## 8. Verification and completion

Existing commands from `src`:

```bash
bash test.sh -o -g 'MapData|mapIcons|runRemap|Progress|Session'
bash test.sh -o
npm run lint:code
```

Phase 0 records the verified client/Puppeteer command using existing tooling.
Do not call the commands above browser coverage until client execution is
confirmed. Run focused model/component tests, affected browser suites, and
relevant existing regressions. No tests ran for this plan-only revision.

- [ ] Existing backend data/examples drive the map without DTO changes.
- [ ] MapIcons load through the existing data-loading boundary.
- [ ] Answered anchor rules and supplied-example stage 2 are tested.
- [ ] Journey fills container width and keeps fixed dimension slots.
- [ ] Stage-border progress and diamond competencies remain separate.
- [ ] Modal/current/selected/completed behavior matches the answers.
- [ ] Routing, Session decisions, return position, and failure recovery pass.
- [ ] Manual list mode and rendering fallback work without saved preference.
- [ ] Current-browser keyboard/screen-reader interaction and cleanup pass.
- [ ] Actual Puppeteer client execution and regression results are recorded.
- [ ] Deferred backend/refresh concerns are documented as source comments.
- [ ] Visual evidence and review results are recorded in docs/plans.

## 9. Remaining bounded clarifications

These do not reopen settled scope or justify new infrastructure:

- **Anchor:** backward-search start/wrap relative to the immediate-next-stage rule, plus existing current-Session
  selection and Progress activity ordering.
- **Read integration:** the actual field-to-MapIcons lookup and nonmutating current
  Session source; these records are not supplied in the examples.
- **Client tests:** reconcile the reported Puppeteer setup with inspected server-only script/entry imports,
  reusing the provided tooling and helpers.
- **Visual interpretation:** reserved empty slots (one offered dimension draws
  one diamond) and primary-over-success background for a current completed stage
  are explicit interpretations to check during fixture/visual review.
- **Acceptance:** identify the final reviewer when needed. Evidence stays in
  docs/plans; no hard performance threshold, new size specification, or TTS review.
