#!/usr/bin/env bash

set -e

# This is the complete test suite kit, that allows to run multiple test
# scenarios during development of our app.
#
# We try to abstract most commends into a few options and defined the following
# behavior:

# defaults:

T_COVERAGE=0            # has coverage disabled
T_FILTER=""             # runs all defined tests
T_RUN_ONCE=""           # runs in watch mode
T_VERBOSE=0             # no extra verbosity
T_SERVER=1              # runs server tests
T_CLIENT=0              # runs no client tests

# options:

SCRIPT_USAGE="
Usage: $(basename $0) [OPTIONS]

Options:
  -c              Activate code-coverage reports
  -g <RegExp>     Filter tests by a given RegExp (uses Mocha-grep)
  -h              Show help
  -o              Runs the tests only once (default is watch-mode)
  -v              Verbose mode with extra prints
"


while getopts "a:bcg:hov" opt; do
  case $opt in
    g)
      T_FILTER=${OPTARG}
      ;;
    v)
	  T_VERBOSE=1
      ;;
    c)
      T_COVERAGE=1
      ;;
    o)
      T_RUN_ONCE="--once"
      ;;
    h)
      echo "$SCRIPT_USAGE"
      exit 1
      ;;
    \?)
      echo "$SCRIPT_USAGE"
      exit 1
      ;;
  esac
done

# build paths:

PROJECT_PATH=$(pwd)
T_PACKAGE_DIRS="../../lib:../../liboauth"
PORT=6519

if [ "$T_VERBOSE" -eq "1" ];
then
	echo "=> Test leaonline-app-backend"
	echo "=> Project path: [${PROJECT_PATH}]"
	echo "=> Port: [${PORT}]"
	echo "=> Lib path(s): [${T_PACKAGE_DIRS}]"
	echo "=> Run once? [${T_RUN_ONCE}]"
	echo "=> grep pattern: [${T_FILTER}]"
	echo "=> coverage: [${T_COVERAGE}]"
	echo "=> Arch: [server: ${T_SERVER}, client: ${T_CLIENT}]"
fi

# create command:

METEOR_PACKAGE_DIRS=${T_PACKAGE_DIRS}  \
    TEST_SERVER=${T_SERVER} \
    TEST_CLIENT=${T_CLIENT} \
    MOCHA_GREP=${T_FILTER} \
    BABEL_ENV=COVERAGE \
    COVERAGE=${T_COVERAGE} \
    COVERAGE_OUT_HTML=1 \
    COVERAGE_APP_FOLDER=$PWD/ \
    COVERAGE_VERBOSE_MODE=${T_VERBOSE} \
    meteor test \
        ${T_RUN_ONCE} \
        --driver-package=meteortesting:mocha \
        --settings=settings.json \
        --port=${PORT}
