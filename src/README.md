# lea.online app backend

## Tests

Install dependencies with `meteor npm install`, then run `./test.sh` from this
directory (or `src/test.sh` from the repository root). By default, both server
and PWA client tests run in watch mode; client tests use Puppeteer's headless
browser. The runner always uses `testSettings.json` and port `6519`.

- `./test.sh -o`: run both suites once.
- `./test.sh -o -c`: run once with HTML and LCOV coverage in `.coverage/`.
- `./test.sh -a server -o`: run only server tests.
- `./test.sh -a client -o -c`: run only client tests with coverage.
- `./test.sh -b`: run in watch mode, then open `http://localhost:6519` manually.
- `./test.sh -g 'learner map' -o`: filter suites by Mocha title.

The explicit test entry point is `tests/main.js`. Register new test directories
there and guard browser-only imports with `Meteor.isClient` (as the map suite
does). The original backend suites remain server-only. Client tests currently
include shared object utilities and the learner map suites. The older component,
completion, routing, and loading suites are not registered: they reference missing
`ui-helpers.tests`, `helpers.tests`, and `webapp-server-helpers` modules and need
porting before they can run. These tests cover the active Meteor app, not the
deprecated React Native client.

This is the server code, handling all relevant data and logic for operating
the app.

## Architecture overview

- The client registers to an account, including restore codes and an optional 
email address, reflected by the `Users` model.

- The `Map` is a read-optimized version of the playable content.

- The `Session` tracks the current state of the user's app usage.

- The `Progress` tracks the user's progress of the stages and milestones on the 
map.

- The `Response` stores all responses and scores of a given item.

- The `Sync` stores a hash, distributed to clients to indicate that content has
been out of sync and should resync.
