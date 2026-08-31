# Agents Instructions

## About leaonline-app

The so called lea.app (similarly lea app, lea. app, and the likes) is a anonymous learning
app for the adults workforce with low literacy, targeting fields, such as nursing, technical jobs, as well
as food industry and common learning tasks in reading, writing, language, and maths.

A detailed domain description and explanation is defined in [DOMAIN.md](./DOMAIN.md)

### Data Structures

An important aspect of the lea

### Migration

While the app was originally built as mobile app (using React Native and a MeteorJs Backend)
it is now in a phase of being migrated to a full Meteor-based progressive web app.

This has multiple reasons and advantages, such as removing the need for appstore/playstore for distributions,
burt also ethe easier build chain, which is basically provided by Meteor out of the box using its internal
build system. Another advantage is the shared libraries (leaonline:corelib and leaonline:ui) which
provide already most functionality and definitions for the core entities that are relevant to the lea app,
but also another, similar structured app (otu.lea).

## Repository Layout

- .deploy - deployment config, do not ever touch
- .staging - deployment config, do not ever touch
- .github - github specific configuration docs, may contain an `agents/` subfolder with agent-specif roles/tasks
- deprecated - code of the deprecated mobile app that is to be migrated into the Meteor core under src/
- docs - the documentation and api docs
- src - the actual Meteor project code, following
  the [common Meteor project structure](https://docs.meteor.com/tutorials/application-structure/#file-structure)

## General Guidelines

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            

## Setup Environment

## Running tests

Use npm scripts, defined in src/package.json for linting.
For tests, use the `test.sh` script with appropriate parameters.

## Building

## Committing work
- never commit on the `main` or `master`branch directly
- always make sure to be on a separate and task-specific branch
- Follow the commit guidelines in CONTRIBUTING.md
- Include issue numbers in commit messages when applicable
- At the end of the commit message, add your agent name in brackets
- Example: fix: user authentication issue (#123) [codex]
