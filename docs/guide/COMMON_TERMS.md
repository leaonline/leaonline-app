# Common Terms

The following describes common terms and contextual references that should be known in order
to better understand the application logic.

## Field

Represents a field of work.

## Dimension

Represents one of 

- "reading" (Lesen)
- "writing" (Schreiben)
- "math" (Rechnen)
- "language" (Sprache)

## Level

Represents an informal level of difficulty.

## AlphaLevel

Represents a formal level of competency, is not related to `level`. Mostly used in
diagnostics.

## TestCycle

A collection of unit-sets for a given `dimension` and `level` 

## UnitSet

A collection of units, including a "story" that provides a contextual environment
including certain actors, sceneries and topics.

## Unit

A unit provides a singular topic for which the items are designed.
It contains multiple "pages" and  there is always one item per page.

## Item

An item in the technical sense of this software is not to be confused with the definition of
item from test-theory, item-response-theory or psychometrics in general.

In this software an item refers to an interactive type that resolves around specific items:

### Choice Item

A choice item asks to select a single or multiple choices regarding a certain question or statement.

### Cloze Item

The cloze item format provides a text or word groups, where characters, words or sentences are
represented by a text input. Users have to enter the correct character, word or sentence.

### Highlight Item

A highlight item asks a user to select (highlight) a word or character.

### Scoring

Each item format requires a specific scoring implementation that fits the structure of the source.
The scoring generally works by matching user responses with correct responses and assign a true/false score
for a given set of linked competencies.

The differences in the scoring implementations is mostly to cover the different data strucutres that
are used be the item formats.

## Session

The session tracks the current "state" of the user.
It's used to determine, which unit was the last edited one, in case the user returns to the app after a certain time. 

## Progress

The progress tracks in a read-optimized fashion, how many units have been completed for a given field
and how many competencies have been achived.

## Response

Stores a (scored) response to an item on a page of a given unit.
It is design to allow the complete association between a user's response, 
a given unit and the related competencies.
