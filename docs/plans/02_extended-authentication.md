# lea.app extended authentication plan

Status: separate proposal; explicitly outside the mobile-to-Blaze PWA migration.

Date: 2026-09-02

## 1. Objective

Extend lea.app beyond the migration's anonymous code/password and restore-code
baseline with optional passwordless email, QR-based authentication/recovery,
and an explicit Google/OAuth disposition. This work begins only after—or as an
independently approved project alongside—the migration and must not block PWA
workflow parity.

## 2. Baseline and boundaries

The migration owns:

- Meteor password authentication implemented as the learner-facing code-based
  username/password flow established by otu.lea;
- automatic login after anonymous registration;
- Meteor resume-token restoration;
- the existing restore-code recovery path;
- logout, deletion, terms acceptance, and secret-safe logging.

This plan owns all additions or changes to that baseline. It must preserve the
anonymous option: no learner is required to provide an email address, use a
camera, or link a third-party identity.

Meteor Accounts remains the authentication and login-session authority for every mode. Extend it
with official provider packages and Accounts extension points; do not create separate user,
login-token, resume-session, or OAuth configuration stores.

## 3. Authentication modes

Define one active routine login mode per account:

| Mode | Credential | Intended availability |
| --- | --- | --- |
| `code` | Human-readable code backed by Meteor password auth | Existing/default |
| `passwordless` | One-time verified email token/link | Optional |
| `qr` | Versioned opaque QR credential or approval challenge | Optional |
| `oauth` | Explicitly approved Google/OAuth identity | Decision required |

Before implementation, decide whether an added mode replaces the active routine
mode or whether a reviewed multi-mode model is required. Never leave hidden
fallback credentials enabled accidentally. Prove a new credential before
disabling an existing one, and make failed/cancelled setup leave the account
unchanged.

## 4. Passwordless email

Use a stable `accounts-passwordless` release compatible with the active Meteor
version. Attach a verified address to the existing anonymous account; do not
silently create a second learner. Subsequent token requests must use sign-in-only
semantics.

Use the package's Accounts APIs (`Accounts.requestLoginTokenForUser`,
`Accounts.sendLoginTokenEmail`, `Meteor.passwordlessLoginWithToken`, verification and login hooks)
rather than custom token documents, expiry jobs, token Methods, or client token parsing. Use the
official `email` package/Accounts templates for delivery. Add persistence only for product metadata
that Accounts does not represent.

Requirements:

- normalize email consistently and define uniqueness rules;
- verify control before activating the mode;
- configure sender, URL, token length/expiry, and plain-language email content;
- use single-use tokens, request/login rate limits, and non-enumerating results;
- never log addresses, tokens, or magic-link URLs;
- support same-device, cross-device, installed-PWA, and expired-link outcomes;
- explain the anonymity/privacy impact and deletion behavior.

Open product decision: if the email already belongs to another account, choose
one explicit policy—reject, recover the existing account, or perform a deliberate
audited merge. No implicit merge is allowed.

## 5. QR authentication and recovery presentation

Choose one routine QR login model before implementation:

- a persistent high-entropy bearer credential scanned by the logging-in device;
  or
- a short-lived challenge shown on the new device and approved by an already
  authenticated device.

QR payloads must be versioned and opaque and must not contain email, restore
code, raw user `_id`, or predictable identifiers. Store only a one-way hash and
credential metadata, compare safely, rate-limit login, return ambiguous errors,
and revoke the previous credential on rotation. Camera use remains optional and
an accessible non-camera fallback is required.

Implement QR proof as an Accounts login extension with `Accounts.registerLoginHandler` and the
corresponding Accounts client login-function mechanism, so success produces a normal Meteor
login/resume token. Generate opaque credentials with `Random.secret` or a documented stronger
platform primitive and protect the handler with `DDPRateLimiter`. Do not create a parallel QR
session or bearer-token middleware outside Accounts.

If the existing restore credential is also rendered as a QR code, that is a
distinct payload type and lifecycle from routine QR login. Generate it within
the application trust boundary and retain a human-readable/printable path.

## 6. Google/OAuth

Google and generic OAuth are not migration features. This project must decide
whether to remove the current transitional Google path, retain it only for
development, or support it as a production routine mode. Production support
requires explicit account-linking, duplicate-account, unlink/recovery, privacy,
provider-outage, and deletion semantics.

If enabled, use the official provider package (`accounts-google` where applicable),
`Meteor.loginWith<ExternalService>`, `service-configuration`/Meteor settings, Accounts external-login
hooks, and `oauth-encryption` for stored OAuth secrets. Do not implement a local OAuth callback,
provider-token store, or service-configuration system.

OAuth must not introduce teacher/SSO assumptions from other lea.online products
into the anonymous learner application.

## 7. Recovery, storage, and token revocation

Separate routine login credentials from emergency recovery. Decide whether
recovery restores a session directly or requires immediate setup/repair of a
routine mode. Store recovery secrets with an appropriate slow hash or keyed
server-side digest, migrate legacy plaintext compatibly, and never log them.

Define which events revoke existing Meteor resume tokens:

- routine-mode change;
- email replacement;
- QR rotation;
- recovery-code rotation or use;
- suspicious login;
- explicit “sign out all devices.”

Use the Accounts token lifecycle and `Meteor.logoutOtherClients`/server-side Accounts APIs where
their semantics fit. Never mutate `services.resume.loginTokens` directly from application code.

Any change from browser Web Storage to HttpOnly-cookie token storage is a
separate security/usability decision because it affects tabs, installed PWA
behavior, offline recovery, deployment, and tests.

## 8. Implementation outline

1. Approve mode, linking, duplicate-account, recovery, privacy, and revocation
   decisions.
2. Version account/credential schemas and define compatible migration/rollback.
3. Implement server methods with ownership checks, rate limits, audit-safe
   events, and non-enumerating errors through Accounts hooks and the existing wrappers around
   `check`/`Match`, `audit-argument-checks`, and `DDPRateLimiter`.
4. Implement accessible setup, proof, login, cancellation, replacement,
   recovery, and settings flows.
5. Add integration and Playwright coverage for same-device/cross-device success,
   expiry, replay, rotation, duplicate identity, recovery, logout, deletion, and
   rollback.
6. Run a privacy/security review and staged rollout independently of migration
   completion.

## 9. Completion criteria

- The anonymous code-based baseline remains fully usable.
- Every enabled mode has explicit linking, recovery, replacement, revocation,
  and deletion semantics.
- Failed setup cannot lock out an account or create an unintended duplicate.
- Secrets and personal data are not exposed through logs, URLs, analytics, or
  QR payloads.
- Accessible non-email/non-camera recovery remains available as approved.
- Migration acceptance and release remain independent of this plan's status.

## 10. Meteor 3.4 references

- Accounts and provider-login APIs:
  <https://release-3-4-0.docs-online.meteor.com/api/accounts>
- `accounts-passwordless`:
  <https://release-3-4-0.docs-online.meteor.com/packages/accounts-passwordless>
- API/package index for `DDPRateLimiter`, `check`, `email`, `random`,
  `service-configuration`, and `oauth-encryption`:
  <https://release-3-4-0.docs-online.meteor.com/api/>
