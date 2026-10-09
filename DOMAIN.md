# Domain Definitions and Explanations

## lea. and lea.online

`lea.` stands for **literacy education for adults**. `lea.online` is a software system comprising
multiple applications for different purposes:

- **lea.app** - anonymous learning application for adults with low literacy.
- **otu.lea** - diagnostic application for identifying individual competencies, primarily used
  in formal literacy classes under supervision.
- **lea.dashboard** - dashboard for supervisors and educators to manage users and visualize
  competency development over time.
- **lea.content** - headless content service that statically contains and provides shared data
  required by the other applications.
- **lea.backend** - internal frontend used by the lea. team to manage content, data, and selected
  application configuration.
- **lea.accounts** - OAuth 2 service providing SSO and teacher-account management across
  applications.

## Domain Invariants Relevant to Migration

The migration must preserve the meaning of the domain entities and their relationships. UI,
transport, persistence, or framework changes must not silently change these semantics.

In particular:

- shared domain definitions should be reused from `leaonline:corelib` where available;
- identifiers and references between fields, dimensions, levels, test cycles, unit sets, units,
  items, competencies, responses, scores, evaluations, and progress must retain their existing
  meaning;
- response-state distinctions are semantically significant and must not be collapsed;
- evaluation and scoring are different concepts;
- evaluation and progress are different aggregation scopes;
- migrations must not infer a missing competency achievement from absence of data unless the
  existing scoring/evaluation rules explicitly do so.

## Product and System Boundary

`lea.app` is a self-directed learning product, not a diagnostic administration tool. Its map,
feedback, completion, and achievement views motivate and orient the learner. They must not expose
teacher workflows, diagnostic records, threshold grades, or competency-level inspection simply
because related lea.online applications support those features.

Historically, the system separated:

- editorial source data in `lea.content`;
- a production backend snapshot plus derived read models and authoritative learner data; and
- locally cached mobile reference data plus transient interaction state.

The PWA may replace device storage and native navigation with browser facilities, but not this
authority model. The backend owns identity, canonical content exposure, session transitions,
durable responses, scoring-derived aggregates, progress, and achievements. The client owns
presentation, accessible interaction, immediate provisional feedback, and recoverable local state.

## Canonical Learner Workflow

The deprecated mobile application establishes the following behavioral sequence:

1. Restore a valid Meteor login session when possible; otherwise offer new anonymous registration
   and account recovery as distinct paths.
2. Record acceptance of the applicable legal terms as part of registration.
3. Load/synchronize the bounded reference data needed to render the learner experience.
4. Select a Field.
5. Open that Field's ordered journey Map, positioned near the learner's latest active progress.
6. Select a Stage, then a Dimension-specific UnitSet offered by that Stage.
7. Start or resume the server-owned Session. Render the UnitSet story before its first Unit when the
   session is new and the story exists.
8. Work through Units and their ordered pages. Capture each Item independently, evaluate it, present
   immediate learner feedback, and durably submit the Response before authoritative advancement.
9. Complete the UnitSet when no next Unit remains, update Progress, show a motivational completion
   summary and optional appraisal, then return to learner navigation with refreshed state.
10. Allow profile access to accessibility preferences, recovery/account actions, and Achievements
    without turning those secondary paths into prerequisites for learning.

This is a behavioral model, not a required URL or component sequence. Browser refresh, back/forward,
reconnect, and installed-PWA relaunch must converge on the same server-owned learning state.

## Data Authority and Synchronization

Legacy synchronization had two independent directions that must not be conflated:

- **Content import:** on configured backend startup, selected full collections were fetched from the
  content service and upserted into the backend. This was deliberately manual/configured so editor
  changes did not automatically become production learning content.
- **Client reference sync:** the app compared per-context server hashes/versions with a local sync
  document. Changed contexts were fetched as complete snapshots, obsolete local documents removed,
  integrity/count checked, and the local hash updated only after successful persistence.

Reference contexts included dimensions, levels, fields, legal text, feedback, ordering, map data,
map icons, and achievement maxima (the exact active inventory must be derived from current contexts).
This reference sync never made the client an editorial or map-generation authority.

Content/reference synchronization is also distinct from learner-data durability. Cached reference
data can make navigation renderable while offline; it does not prove that Responses, Session
transitions, Progress, or account changes reached the backend.

## Terminology

### Field

A **Field** represents an area or topic of learning, optionally with a specific theme.

Examples include nursing, food industry, technical occupations, and financial literacy.

### Dimension

A **Dimension** defines a subject or dimension of learning, such as Reading, Writing,
Mathematics, or Language Understanding.

A field can contain learning material for a single dimension or a mixture of dimensions.

### AlphaLevel

An **AlphaLevel** represents a major category of competencies associated strongly with a
specific dimension.

Alpha levels 1 through 5 describe fine-grained competency levels below the lowest elementary
school competency level commonly represented by PISA. Lower alpha levels include fundamental
literacy elements such as recognizing individual letters, numerals, and words. Alpha level 5
contains competencies closest to the lowest elementary-school level, approximately PISA level 1.

### Competency and Competency Category

A **Competency** is a granular positive description of a skill associated with a specific
dimension. Competencies are bounded by other competencies and describe what a learner can do.

Lack of fulfillment of a competency represents that the corresponding competency has not been
demonstrated; migration code must not reinterpret this absence without an explicit domain rule.

A **Competency Category** groups related competencies where such grouping is defined by the
content/domain model.

### Level

A **Level** defines difficulty relative to the competencies that can be achieved by solving its
associated units. Ideally, levels form a linear progression.

A Level is not the same concept as an AlphaLevel.

### TestCycle

A **TestCycle** is a collection of unit sets bound to one dimension and one level.

Ideally, it groups competencies that are related or close to one another. A test cycle contains
one or more UnitSets but is associated with exactly one Dimension and one Level.

### UnitSet

A **UnitSet** is the bounding context for a collection of Units.

It often defines a story or narrative context in which prototypical actors from the associated
field encounter work-related situations. These situations are projected into tasks presented to
the learner.

A UnitSet contains one or more Units.

The optional story belongs to the UnitSet context. It introduces the sequence before the first Unit
of a new session. It is not itself a Unit and should not be repeatedly shown merely because the
learner reloads or resumes after progress has begun.

### Unit

A **Unit** defines a specific problem context, often but not necessarily narrative. It contains:

- an instruction;
- an optional stimulus;
- one or more pages containing the tasks to solve.

Each page may contain Items.

Legacy code supports pages with no Item and pages with multiple Items/content elements, even though
an older guide describes one Item per page. The migration must preserve the broader executable
behavior: empty pages remain navigable, while multiple Items are captured, scored, and persisted
under independent item/content identifiers.

### Item

An **Item** is the smallest interaction unit required to solve a task.

An Item is associated with one or more Competencies and with scoring rules used to determine
whether the learner's response demonstrates fulfillment of those competencies.

### Response

A **Response** is created when a learner interacts with an Item. Responses are consumed by
scoring logic to determine competency fulfillment.

The following response states are distinct and must remain distinguishable during migration:

- **entered** - a value has been entered;
- **absent** - no value has been entered;
- **null** - a previously entered value was deleted;
- **`__undefined__`** - the learner omitted the interaction entirely, for example by skipping
  the page or interacting with other items on the page but not this item.

Do not normalize these states into a single "empty" value unless existing domain logic explicitly
requires that transformation.

A durable Response is associated with the authenticated learner, Session, UnitSet, Unit, page,
Item, Item type, raw response state, and score result/competency associations required by the
canonical model. Identity and content relationships are server-verified. Immediate client scoring
is learner feedback, not authority to invent or alter persisted competency achievement.

### Scoring

**Scoring** evaluates responses for individual items/competencies according to their scoring
rules.

Scoring is not the same as Evaluation.

The mobile learning loop used scoring immediately after the learner selected “check,” displaying
correct/incorrect state before navigation. This feedback is formative. It must remain accessible
without relying only on color or sound and must not expose diagnostic interpretation unless a
separate product requirement approves it.

### Evaluation

**Evaluation** aggregates existing scores for a TestCycle and determines the achieved
competencies represented by that cycle.

The result provides a summary of competency achievement and forms the basis for determining how
far relevant AlphaLevels have been achieved. For example, if 50% of the competencies associated
with an AlphaLevel are achieved, that AlphaLevel may be considered 50% achieved according to the
app's evaluation rules.

A TestCycle can contain competencies from more than one AlphaLevel because higher competencies
of one AlphaLevel can overlap with lower competencies of the next. Consequently, an Evaluation
can describe both:

- which competencies were fulfilled and to what degree; and
- which AlphaLevels were covered and to what degree by that TestCycle.

### Progress

**Progress** aggregates achievements across TestCycles.

Evaluation describes the outcome of a particular TestCycle. Progress tracks the broader
longitudinal state across multiple TestCycles and therefore represents the learner's accumulated
achievement rather than a single-cycle snapshot.

In the historical lea.app backend, the learner-facing Progress read model was grouped by user and
Field, with UnitSet entries containing page-based progress, fulfilled-competency counts, Dimension,
and completion state. The map and Achievements combined those learner values with separately
precomputed maxima. This describes the legacy aggregation shape, not a license to double-count:
retry, uniqueness, and idempotency rules must be explicitly defined and server-enforced during the
migration.

### Session

A **Session** is the authoritative, resumable state of one learner working through one UnitSet. It
binds the learner to the relevant Field and Dimension and records current/next Unit, accumulated
progress and competencies, and lifecycle timestamps such as start and completion.

The UnitSet's Unit order determines transitions. A new session with a story initially points to the
first Unit as upcoming; without a story it begins at the first Unit. Advancement from the story must
not count Unit progress. A completed session has no current/next Unit and must not be silently
reopened as the same incomplete attempt.

Local page, route, and input caches are projections of a Session. They may help recovery but cannot
advance, complete, or transfer ownership of it.

### Learner Map, Stage, and Milestone

The **Learner Map** is a read-optimized projection for one Field. It combines server-generated,
ordered topology with account-specific progress at read/render time.

A **Stage** is a selectable step on that journey. It groups the UnitSets available at the same map
position, normally at most one per Dimension, so Stage selection is followed by a Dimension/UnitSet
choice where more than one exists. Stage is a navigation/read-model concept, not a replacement for
Level, TestCycle, or UnitSet.

A **Milestone** separates or summarizes Level sections and displays aggregate progress. Start and
finish markers are presentation entries derived around the canonical stage/milestone topology.
Alternating visual placement, connectors, icons, rings, and competency diamonds communicate the
journey, but selection availability must come from an explicit policy also enforced by the server.

Static topology and learner state have different lifecycles and cache scopes. Never mutate a shared
topology object with one learner's progress or use visual locked/unlocked styling as access control.

### Achievement and Appraisal

An **Achievement** is a learner-facing aggregate comparing accumulated progress/competencies with
precomputed attainable maxima across Fields and Dimensions. It is motivational and longitudinal;
it is not an Evaluation report or diagnostic record.

An **Appraisal** is optional learner feedback about the completed UnitSet (historically a simple
sentiment scale). It does not affect scoring, Progress, completion, or access to later learning.

### Anonymous Account and Recovery

An anonymous learner still has an authenticated internal account. No real-world identity is
required for the core workflow. A stored resume token supports routine return on the same device;
recovery material supports access from another device. Recovery credentials, login tokens, and any
optional future email/QR login method are separate credential concepts and must not be logged or
embedded in analytics.

Account deletion is a deliberate learner action. Registration, token restoration, recovery,
logout, deletion, and loss of browser storage are distinct states and require distinct outcomes.

### Connectivity and Accessibility

The legacy app separately observed general internet reachability and Meteor backend/DDP reachability,
automatically reconnecting and showing a non-destructive status warning. The PWA must likewise avoid
equating `navigator.onLine`, a cached application shell, an authenticated DDP connection, synced
reference content, and durably submitted learner work.

TTS voice/speed preferences, readable language, large predictable controls, keyboard/touch access,
visible focus, and feedback that does not rely solely on color, animation, vibration, or sound are
part of the learning behavior for this audience. Platform-specific vibration or native secure
storage are implementation details; their accessible purpose must be preserved through suitable web
behavior rather than copied literally.

## Meteor Realization Boundary

The domain concepts above do not require parallel framework infrastructure. In the Meteor PWA:

- an Anonymous Account is a Meteor account and authenticated DDP identity;
- routine login, resume tokens, logout, and optional provider/passwordless modes should use the
  Meteor Accounts system and its official provider packages;
- a lea.app Session is a domain document/state machine, not Meteor's client-only `Session` UI store;
- Responses, Progress, and derived read models use Meteor Methods and Mongo collections, with
  publications/subscriptions only where reactive delivery is a product need;
- connectivity presentation starts from Meteor's reactive connection status, while browser network
  signals are only supplementary hints;
- server startup synchronization is orchestrated through Meteor startup/configuration facilities,
  but controlled content promotion and validation remain lea.app domain/operational rules.

Framework primitives do not change the invariants in this file. Accounts does not define recovery
product policy; Methods do not make transitions idempotent automatically; Mongo does not define
scoring/progress; and DDP reconnect does not make an unacknowledged Response durable. Prefer the
Meteor primitive, then add only the missing domain rule.
