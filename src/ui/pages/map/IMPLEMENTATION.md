# Learner map implementation notes

This folder implements the UI slice of `docs/plans/04_blaze-learner-map.md`.
Only files in this folder were intentionally changed. Existing untracked model,
scene and test files were extended. No commits were created.

## Data and navigation decisions

- `model.js` derives immutable stages, stable IDs, separate page/competency
  values, dimension slots, milestones, markers and layout from backend data.
  Stage IDs also serve as Blaze `_id` keys so updates preserve focused nodes.
- The anchor considers a started, incomplete, noncancelled local Session first,
  then incomplete Progress entries (including zero progress), then completed
  work. A fully completed stage considers its immediate successor, then searches
  from the end of the journey backwards. This resolves the plan's open search
  boundary as a documented working interpretation, not a new backend rule.
- Progress dates order entries only when all relevant records have valid dates;
  otherwise original array order is the deterministic fallback. Current
  `Progress.update` does not write activity dates, so actual last activity cannot
  always be recovered. Its `undefined += progress` defect is not repaired here.
- Current plus complete uses primary background, a full success border and the
  accessible completed description. Missing dimensions leave empty shared slots.
- MapIcons document IDs are resolved by `SyncState.methods.getDocs`, the existing
  public reference-snapshot API, then read through `loadContentDoc` by `_id`.
  Field IDs are never passed as icon document IDs. Ambiguous/missing configuration
  falls back to the list with an editorial message; no icons are substituted.
  A local context copy supplies the missing `isLocal` factory flag.
- `Session.data()` is the only existing nonmutating current-Session source.
  Its account and field must match. Fresh loads fall back to Progress; no
  creating Session method is called until a UnitSet is explicitly selected.
- The getter does not distinguish a newly created storyless Session from an
  untouched first-unit attempt. Both enter that first unit directly. Recorded
  work prompts continue/restart inside the chooser, with only one focus trap.
- Storyless restart advances once and reloads the authoritative Session before
  installing it locally. Async completions are guarded by account, field,
  instance generation and chooser selection generation.
- Route `stage` takes precedence over `unitSet`, then same-account/field return
  position, then automatic anchor. Query changes use the existing router. Back
  closes the chooser; Forward reopens it without creating a Session. Explicit
  dismissal removes the query hint with replace-state. View mode is not saved.
- Page entry and explicit retry refresh data. Other refresh policies, remapping,
  and backend persistence changes remain deferred as requested.

## Validation on 2026-10-08

The requested command was run from `src`:

```sh
bash test.sh -o -g 'MapData|mapIcons|runRemap|Progress|Session'
```

The sandbox initially denied listening on port 6519. Retrying with permission
started Meteor and MongoDB, but application startup failed before Mocha tests
executed: `tests/validateSchema.js` assigns `settings.public = {}` and then
validates it. The first error is `Env is required`, followed by the other public
settings. The build also reports existing unresolved `detect-os` and browser
`perf_hooks` imports. These are outside the allowed edit boundary.

The post-change command including `learner map` in the grep expression reached
the same startup failure. All map JavaScript and test files passed the project's
`standardx` linter (cache redirected to `/tmp`); `git diff --check` passed.
The requested repository-wide `npm run lint:code` reports 940 existing problems
outside this map implementation, so a clean global lint result is not claimed.

Further browser-test integration is also outside that boundary:

- `src/test.sh` hardcodes `T_CLIENT=0` and has no option to enable it.
- `src/package.json` sets `meteor.testModule` to `tests/main.js`; that entry does
  not import map suites. `map/tests/index.js` is ready for that import.
- No Puppeteer dependency is declared in the inspected `src/package.json`.

Consequently, no passing behavioral-test count, red/green TDD cycle, browser
acceptance, screen-reader acceptance, completion-flow acceptance, or visual
sign-off is claimed. New suites cover the supplied 39-stage/five-milestone
fixture, anchors, percentages, independent competencies, immutable inputs,
replacement attempts, sparse layout, Session decisions/failure guards,
reference reads, SVG keyboard/focus/resize/cleanup, and chooser behavior.

The two supplied mobile screenshots were inspected as implementation references.
Live screenshots and current-browser/manual acceptance remain pending a working
test/application environment. Notes are stored here instead of `docs/plans`
because the user explicitly restricted writes to the map folder. The final
reviewer has not been identified.

To finish automated acceptance, the application test entry must import
`../ui/pages/map/tests`, the public-settings validation failure must be resolved,
and the supplied test script must enable its existing client/browser runner.
Those changes require an expanded file scope; they were not made implicitly.
