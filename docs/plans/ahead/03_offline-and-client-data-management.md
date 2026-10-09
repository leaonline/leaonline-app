# lea.app offline learning and client-data management plan

Status: deferred post-migration proposal; not required for the first Blaze PWA release.

Date: 2026-09-02

## 1. Objective

Extend the stable migrated PWA from static-asset caching and reconnect recovery
to deliberately supported offline learning. Define the complete lifecycle of
browser-resident learner data, account persistence, versioned learning content,
queued responses, replay, eviction, logout, and account/device changes before
claiming that Units can be completed offline.

## 2. Migration baseline

The migration provides only:

- an installable PWA;
- cached application-shell and immutable static build assets;
- explicit online/reconnecting/offline status;
- safe DDP reconnection and online submission retry;
- normal Meteor browser-session persistence.

It does not cache authenticated learning content for offline execution, queue
durable responses, advance Sessions offline, guarantee persistence after site
data is cleared, or provide enhanced device-change/storage-loss warnings.

Reuse Meteor's online capabilities before adding offline machinery: Accounts owns identity/resume,
reactive `Meteor.status()` and `DDP.onReconnect` own DDP reconnect signaling, Methods own replay RPC,
EJSON owns DDP-compatible serialization, and `autoupdate`/WebApp hooks own bundle-update signaling.
The service worker and durable browser outbox remain custom because Meteor does not provide
application-specific offline Method queuing, conflict resolution, or IndexedDB lifecycle policy.

## 3. Required decisions

Before implementation, decide:

- which Fields, UnitSets, Units, media, reference contexts, and derived map data
  may be downloaded and how learners request/see download state;
- whether offline work can start only from a server-issued Session snapshot;
- ordering and conflict rules when the same account works on multiple devices;
- whether queued attempts preserve every event or only the effective UnitSet
  performance defined by the migration contract;
- storage quotas, eviction priority, retention time, and behavior when the
  browser evicts or the learner clears site data;
- whether anonymous browser accounts persist indefinitely and the exact
  plain-language warning shown before storage clearing, logout, account switch,
  browser reset, or device change;
- private-browsing and installed-PWA limitations for each supported browser;
- encryption/privacy requirements for locally stored learner responses and
  cached content.

## 4. Architecture boundaries

- The backend remains authoritative for identity, content promotion, Session
  transitions, scoring, Progress, and Achievements.
- Offline caches contain only versioned snapshots originating from the
  backend's approved production content snapshot, never live `lea.content` data.
- Static topology/content and account-scoped learner data use separate stores
  and cache keys.
- Service workers must not generically cache DDP/SockJS or authenticated method
  traffic.
- Replayed operations call the same idempotent Meteor Methods through `Meteor.callAsync` as online
  operations; do not introduce a parallel REST mutation API.
- Serialize DTOs with EJSON where Meteor/DDP types must survive browser persistence, then explicitly
  test any value that Mongo cannot preserve identically.
- Logout, account switch, deletion, and recovery must clear or rebind
  account-scoped caches deliberately; data must never leak between anonymous
  accounts.

## 5. Content cache

Define a manifest for an offline-capable UnitSet containing all required content,
reference documents, renderer dependencies, and media hashes. Download and
validate it atomically. A UnitSet is advertised as offline-ready only when the
whole manifest is present and verified.

Content promotion/version changes must mark incompatible cached work clearly.
Do not mix topology, Units, Items, scoring definitions, or media from different
approved backend snapshots.

## 6. Response outbox and replay

Use a durable account-scoped outbox with stable operation/transition ids. Define:

- capture order for page responses and Session transitions;
- idempotent replay after reconnect or app update;
- dependency ordering so advancement cannot precede accepted responses;
- server verification against the cached content/topology version;
- duplicate, stale-version, rejected-content, revoked-account, and already-
  superseded UnitSet outcomes;
- learner-facing conflict and retry/recovery states;
- cleanup only after authoritative server acknowledgement.

Use reactive `Meteor.status()`/`DDP.onReconnect` only to trigger replay attempts. Server
acknowledgement remains the durability boundary; retry/idempotency belongs in Methods and unique
Mongo indexes, not in connection event handlers.

Client scoring remains provisional. The server recomputes or verifies canonical
scores during replay before Progress or Achievements change.

## 7. Account persistence and client-data lifecycle

Provide plain-language status and warnings for:

- browser storage/site-data clearing;
- switching or losing devices;
- private browsing and automatic browser eviction;
- sign-out, account switch, recovery, and deletion;
- application/service-worker upgrades with pending work;
- storage quota exhaustion and partial download cleanup.

Make recovery material accessible before destructive local-data actions where
appropriate. Never imply that cached work is synchronized until the server has
acknowledged it.

## 8. Verification

Cover unit and Meteor integration contracts exhaustively, then use focused
Playwright workflows for:

- complete download and verified offline readiness;
- offline page work and completion followed by ordered replay;
- interruption/restart during download and replay;
- duplicate replay and multi-device conflict;
- promoted-content version change with pending work;
- quota failure, eviction, cleared data, and private browsing;
- logout/account switch/deletion without cross-account leakage;
- service-worker update while work is queued;
- accessible status, warnings, conflicts, and recovery actions.

## 9. Completion criteria

- The app claims offline availability only for complete verified content.
- Pending responses and transitions survive supported restart/update scenarios.
- Replay is ordered, idempotent, server-verified, and account-isolated.
- Learners can distinguish local, queued, rejected, and synchronized work.
- Storage-loss/device-change limitations and recovery actions are explicit.
- Content promotion and account deletion cannot leave unsafe mixed or orphaned
  learner data.
- This plan is implemented and reviewed independently after migration stability.

## 10. Meteor 3.4 references

- Server connections, Methods/`Meteor.callAsync`, EJSON, Mongo indexes, and Tracker:
  <https://release-3-4-0.docs-online.meteor.com/api/>
- Accounts browser token persistence:
  <https://release-3-4-0.docs-online.meteor.com/api/accounts>
- `autoupdate` and WebApp update hooks:
  <https://release-3-4-0.docs-online.meteor.com/packages/autoupdate>
