# lea.online App

[![Build Android APK](https://github.com/leaonline/leaonline-app/actions/workflows/build_android_apk.yml/badge.svg)](https://github.com/leaonline/leaonline-app/actions/workflows/build_android_apk.yml)
[![Test suite](https://github.com/leaonline/leaonline-app/actions/workflows/jest_test.yml/badge.svg)](https://github.com/leaonline/leaonline-app/actions/workflows/jest_test.yml)
[![Lint Test](https://github.com/leaonline/leaonline-app/actions/workflows/lint_test.yml/badge.svg)](https://github.com/leaonline/leaonline-app/actions/workflows/lint_test.yml)
[![Project Status: WIP – Initial development is in progress, but there has not yet been a stable, usable release suitable for the public.](https://www.repostatus.org/badges/latest/wip.svg)](https://www.repostatus.org/#wip)
![GitHub](https://img.shields.io/github/license/leaonline/leaonline-app)

## About

The lea.online app is a mobile app, developed using React-Native and Meteor.


## Get the app

TBD, we will link the app store / play store links here, once we have a release


## Development

If you wish to participate in development, please make sure you have read our
contribution guidelines.

## Install for development

### Notes

This project heavily utilizes Meteor and it's tech-stack so the installation
will install `Meteor` for you. Note, that Meteor already ships with NodeJs
and NPM, so you don't need them to install yourself.

However, if you have them already installed, Meteor won't mess up your
environment, so it's safe to install it.

### Prerequisites

If you don't have set up any lea.online projects you need to create
a top-level folder that will contain projects and libraries:

```bash
$ mkdir leaonline
$ cd leaonline
$ git clone git@github.com:leaonline/leaonline-app.git
```

### Use the installation script

We provide you an installation script, which you should run from your terminal:

```bash
$ cd leaonline-app
$ ./scripts/install.sh
```

> **Do not run the script with `sudo` and do not `cd` into the `scripts` directory.**

The script will ask you several questions to optimize your installation, if you
however wish to do a full manual installation, please visit the 
[manual installation](docs/guide/manual_install.md) guide.

### Install content server (optional)

If you want to execute units, you need to get the [leaonline-content](https://github.com/leaonline/leaonline-content)
server and make it available to the backend.

### Run the apps

To run the apps, make sure you have installed everything first. See the prior
section on how to install.

To run the backend app, you need to do the following:

```bash
$ cd backend
$ ./run.sh
```

To run the mobile app, you need to do the following:

```bash
$ cd src
$ meteor npm run start
```

### Run the tests

We use jest (as default, defined by expo) to run the app tests and mocha to run
the backend tests.

To tun the tests on the backend, please execute the `./test.sh` script in the 
`backend` project folder.

To run the tests for the app, please execute `meteor npm run test` in the app's `src`
folder.

### Documentation

We use jsDoc for api documentation of the app, as well as of the backend.
In each projects you can simply run

```bash
$ meteor npm run docs
```

The docs are generated in the output folder `docs`.
