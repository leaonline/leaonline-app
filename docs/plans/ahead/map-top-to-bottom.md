# Map: top-to-bottom presentation and varied connectors

Status: proposed; planning only. No application or test changes made.
Interpret “TTD” as test-driven development (TDD), subject to Q1 below.

## Scope

Display Start, stages/milestones in their existing canonical order, and Finish
from top to bottom. Give connecting lines visibly varied, smooth curves.
Preserve stage placement left/right, numbering, IDs, dimension slots, progress,
completion, anchors, selection, routing, sessions, accessibility, and list fallback.
Do not change backend topology, data contracts, refresh policy, or dependencies
unless needed to run the existing browser test harness.

## Inspection findings

- `model.js:layoutMap` currently decreases Y as entries advance and uses identical
  midpoint-based cubic control points. This is the primary change location.
- `learnerMap.js` maps ArrowUp to the next stage and ArrowDown to the previous
  stage. These mappings must flip with the visual direction. DOM order already
  follows the canonical journey; do not reverse the input or DOM.
- Five existing test files cover model, navigation, reference reads, scene, and
  chooser behavior. Direction and keyboard tests currently assert upward travel.
  `map.js` page orchestration has no direct suite in this folder.
- `src/tests/main.js` does not import the map UI tests; `src/test.sh` hardcodes
  `TEST_CLIENT=0`. Existing test source is therefore not proof of runnable coverage.
- `src/tests/validateSchema.js` replaces public settings with `{}` before validation.
  `map/IMPLEMENTATION.md` records startup failure here and unresolved imports during
  earlier runs. These failures have not been rerun or measured in this planning task.
- The supplied `initDependencies.js` initializes contexts, language/translations,
  and template APIs. Keep its production behavior unchanged; page tests must account
  for dependency readiness rather than silently bypass all initialization.

## Minimal implementation sequence: test first

1. **Establish an executable baseline.** Import `ui/pages/map/tests` from the test
   entry, add an explicit client-test option to the existing `test.sh`, and configure
   its supported browser runner. Resolve only confirmed test-startup blockers,
   preserving settings validation against a valid, nonsecret test fixture. Run the
   existing map suites before changing behavior; record server and browser counts.
   Keep harness repairs separate from the presentation change.

2. **Add missing regression tests while behavior is unchanged.** Use the existing
   Mocha/Chai/Sinon and Blaze renderer helpers. Add a client-only `page.tests.js`
   through `map/tests/index.js`; extend existing suites for the gaps below. Restore
   stubs, DOM, observers, route/account state, and pending async work after each test.
   Use controlled promises for lifecycle races. Do not refactor unrelated production
   code simply to increase coverage; use a thin test seam only if necessary.

   | Area | Missing behavior to protect |
   | --- | --- |
   | `map.js` loading | Dependency readiness; success; invalid/missing topology and retry; missing versus failed/wrong-account progress; icon/metadata/render failure leading to usable list fallback; map/list toggle preserving selection. |
   | `map.js` lifecycle | Account/field changes, retry superseding an older load, destruction during loading, and account-scoped collection cleanup; stale results must not install state. |
   | `map.js` navigation | Stage/UnitSet URL hints and Back/Forward; return-position account/field isolation; chooser dismissal restoring focus in scene/list; initial anchor scrolling; no Session mutation on page entry or stage selection. |
   | `map.js` selection | Explicit UnitSet click only; busy/offline guards and duplicate clicks; session error display/retry; chooser close/change, account/field change, or destruction during requests must suppress stale installation/navigation. |
   | `navigation.js` | User/field/UnitSet/current-unit mismatch, completed Session rejection, restart identity mismatch, failed or mismatched advance/reload, and cancellation after each awaited boundary. Retain existing story/continue/restart cases. |
   | `model.js`, `data.js` | Cancelled/completed/wrong-field Session anchor fallback; mixed/missing activity dates; malformed/duplicate topology; metadata/icon fallback; icon document field/shape mismatch and rejected reads. |
   | Scene/chooser | Initial scroll target; click and keyboard boundaries/Home/End; unavailable accessible values; decision focus transitions and callbacks; retain existing resize, stable-node, clip-ID, completion, Escape, and cleanup tests. |

3. **Red: specify the new presentation.** Replace only the intentional upward
   assertions. Require strictly increasing Y from Start through Finish, unchanged
   canonical sequence/IDs, and Down=next / Up=previous. Retain Right=next,
   Left=previous, Home/End, Enter/Space, and tab order. Test empty/single-stage and
   supplied 39-stage/five-milestone maps at 240, 320, 768, and 1320px widths, plus
   invalid-width fallback. Confirm the new direction/curve tests fail for the
   intended reason against the current implementation.

   For connectors, require exactly one path per adjacent entry pair, exact endpoints,
   finite coordinates, bounded control points, and multiple distinct normalized
   curve shapes on the fixed long-map fixture. Require identical paths for the same
   topology/width across calls and progress updates. Resizing may scale geometry but
   must preserve each connector's variation parameters. Avoid probabilistic assertions
   or large SVG snapshots.

4. **Green: make the smallest presentation change.** Assign increasing Y in
   `layoutMap`; derive small deterministic curve variations from the adjacent stable
   entry IDs, independent of learner state. Keep cubic control points within the
   viewport and the vertical interval between endpoints so paths progress downward
   without loops. Flip the two vertical keyboard mappings. Review connector clearance
   around stage rings, diamonds, milestone labels, and decorations; adjust presentation
   geometry only where needed. Retain the existing pure layout function and SVG renderer.

5. **Regression gate and handoff.** Run affected tests with both server and browser
   execution, then related MapData/MapIcons/remap/Progress/Session suites via `test.sh`.
   Use the existing `-g` filtering and `-c` coverage option; confirm suites actually
   execute and report remaining uncovered branches by file, not an invented percentage.
   Run repository lint and distinguish existing failures from changed-file failures.
   Visually inspect the real fixture on narrow and wide screens: full downward journey,
   varied curves, no clipping/obscured controls, anchor positioning, resize, keyboard,
   chooser focus return, and fallback list. Update `map/IMPLEMENTATION.md` with actual
   results and any unresolved blockers. Do not declare completion from server tests alone.

## Questions and editable answers

**Q1 — Does “TTD” mean test-driven development (TDD)?**

Answer: Proposed: yes; baseline → regression protection → failing new-behavior tests
→ minimal implementation → complete regression run. User answer: yes

**Q2 — Should random-looking curves stay stable between visits?**

Answer: Proposed: yes, deterministic per adjacent entry IDs; no new randomness on
rerender, progress changes, or revisit. User answer: yes

**Q3 — How irregular should the connectors be?**

Answer: Proposed: moderate asymmetric bends using one cubic curve per connection,
with no loops, crossings, or randomized stage positions. Apply consistently to
Start/milestone/Finish connections as well. User answer: as proposed

**Q4 — Should opening the map still center the learner's current anchor?**

Answer: Proposed: yes. Top-to-bottom changes journey direction; retain existing
URL/return-position/progress anchoring instead of always scrolling to Start.
User answer: yes

**Q5 — Should diamonds or decorative icons also move below their stages?**

Answer: Proposed: no; preserve current placements, with only small clearance fixes
if visual review demonstrates an overlap. User answer: no
