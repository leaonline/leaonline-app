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

### Unit

A **Unit** defines a specific problem context, often but not necessarily narrative. It contains:

- an instruction;
- an optional stimulus;
- one or more pages containing the tasks to solve.

Each page may contain Items.

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

### Scoring

**Scoring** evaluates responses for individual items/competencies according to their scoring
rules.

Scoring is not the same as Evaluation.

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
