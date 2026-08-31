# Domain Definitions and Explanaitons

## lea. and lea.online

lea. stands for "literacy education for adults", while lea.online
is a software system, comprising of multiple applications for specific purposes:

- lea.app - learning app for low literacy people, used anonymously by individuals
- otu.lea - diagnostic app for identifying individual competencies, mostly used in formal literacy classes under
  supervision
- lea.dashboard - dashboard for supervisors and educators to manage users and visualize competency development over time
- lea.content - a headless content service, statically containing and providing all necessary data that is shared by the
  other applications
- lea.backend - a frontend for the internal lea. team to manage content and data, and some app configurations
- lea.accounts - an oauth2 server managing SSO and teacher accounts across the applications

## Terminology

**Field**
A field represents an area or topic of learning, optionally consisting of a specific theme.
Examples include: nursing, food industry, technical jobs, financial literacy.

**Dimension**
A dimension defines a dimension or subject of learning, such as Reading, Writing, Maths, Language understanding.
It can occur singular or mixed throughout all fields.

**AlphaLevel**
Represents a major category of competencies that are strongly bound to a specific dimension.
These levels (1 to 5) define fine granular levels of competencies below the lowest elementary-school level definition of
competencies (defined by PISA).
The lowest alpha levels include fundamental literacy elements, such as identifying single letters, numerals, and words.
In turn, the highest alpha levels (alpha level 5) contain the competencies, closest to lowest elementrary school level
of competencies
(PISA level 1)

**Competency and competency category**
Competencies are granular definitions of skills, related to a specific dimension.
They define positively what a person can do and are bounded by other competencies.
What a person cannot do, in turn, is therefore defined by the absence or non-fulfillment of a competency.

**Level**
A level defines a certain difficulty in relation to the competencies that can be achieved by solving the associated
units. Optimally, levels are used to define a linear progression.

**TestCycle**
A test cycle defines a collection of unit sets that are bound to a specific dimension and level.
Optimally, they bundle only competencies that are related or at least similar and "near by".
It contains at least one or more unit-sets but is only bound to a single dimension and level.

**UnitSet**
A UnitSet (unit-set/unit set) is a bounding context of a collection of units.
It often defines a specific "Story" that provides a narrative context for the units,
where prototypical actors of the related field follow the narrative and have to solve certain
problems in relation to their work (which will then in the units be project as the tasks to the users)
It contains at least one or more units

**Unit**
A unit contains a specific (often, but not always, narrative) problem context,
an instruction, an optional stimulus and one or more pages with the actual tasks to solve.
Each page can contain items, which are the smallest units of interactions, required to solve the task at hand.
An item is associated with one or more competencies and scoring rules, used to determine whether the solution
of the task can be regarded as fulfilment of the competency.

**Response**
By interacting with an item, users create responses, that will be used during scoring, whether the user
has fulfilled the competency. There are multiple states of responses:

- entered → a value has been entered
- absent → no value has been entered
- null → a previously entered value was deleted
- __undefined__ → the user omitted the interaction entirely, for example by skipping the page or by not interacting
  with the specific item but other items on the page

**Evaluation**
The evaluation is not to be confused with scoring. In the evaluation, all existent scores of a test cycle are
collected and used to count the number of achieved competencies to provide a summary of achievement.
These in turn build the basis to define the level of how far an alpha level has been achieved.
For example, if 50% of all competencies of an alpha level are achived then the alpha level is considered
to be 50% achived.
Usually a testcycle also contains competencies from more than one alpha levels (because the highest competencies
of an alpha level overlap with the lowest of the consecutive alpha level), which is why at the end of an evaluation,
the user knows exactly,
which competencies were fulfilled to which degree - and which alpha levels were covered to which degree
by this very test cycle.

**Progres**
Building on top of the evaluation, the progress tracks all achivements across test cycles.
This is necessary, because the achivements in a testcylce only define a snapshot of its units.
Progress is used to track "the bigger picture".