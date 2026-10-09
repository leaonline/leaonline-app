#!/usr/bin/env bash

set -e

# This is the complete test suite kit, that allows to run multiple test
# scenarios during development of our app.
#
# We try to abstract most commends into a few options and defined the following
# behavior:

# defaults:

T_BROWSER="puppeteer"   # uses headless browser for client tests
T_COVERAGE=0            # has coverage disabled
T_FILTER=""             # runs all defined tests
T_RUN_ONCE=""           # runs in watch mode
T_VERBOSE=0             # no extra verbosity
T_SERVER=1              # runs server tests
T_CLIENT=1              # runs client tests

# options:

SCRIPT_USAGE="
Usage: $(basename $0) [OPTIONS]

Options:
  -a <String>     Filter architecture: 'server' or 'client'
  -b              Run client tests in a manually opened browser
  -c              Activate code-coverage reports
  -g <RegExp>     Filter tests by a given RegExp (uses Mocha-grep)
  -h              Show help
  -o              Runs the tests only once (default is watch-mode)
  -v              Verbose mode with extra prints
"


while getopts "a:bcg:hov" opt; do
  case $opt in
    a)
      case "$OPTARG" in
        client) T_CLIENT=1; T_SERVER=0 ;;
        server) T_CLIENT=0; T_SERVER=1 ;;
        *) echo "Invalid parameter value for -a: $OPTARG"; exit 1 ;;
      esac
      ;;
    b)
      T_BROWSER=""
      ;;
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
      exit 0
      ;;
    \?)
      echo "$SCRIPT_USAGE"
      exit 1
      ;;
  esac
done

# build paths:

PROJECT_PATH=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
cd -- "$PROJECT_PATH"
T_PACKAGE_DIRS="../../lib:../../liboauth:../github"
PORT=6519

if [ "$T_VERBOSE" -eq "1" ];
then
	echo "=> Test leaonline-app"
	echo "=> Project path: [${PROJECT_PATH}]"
	echo "=> Port: [${PORT}]"
	echo "=> Lib path(s): [${T_PACKAGE_DIRS}]"
	echo "=> Run once? [${T_RUN_ONCE}]"
	echo "=> grep pattern: [${T_FILTER}]"
	echo "=> coverage: [${T_COVERAGE}]"
	echo "=> Browser: [${T_BROWSER}]"
	echo "=> Arch: [server: ${T_SERVER}, client: ${T_CLIENT}]"
fi

# create command:

T_BABEL_ENV="development"
if [ "$T_COVERAGE" -eq "1" ]; then
  T_BABEL_ENV="COVERAGE"
fi

METEOR_PACKAGE_DIRS=${T_PACKAGE_DIRS}  \
    TEST_BROWSER_DRIVER=${T_BROWSER} \
    TEST_SERVER=${T_SERVER} \
    TEST_CLIENT=${T_CLIENT} \
    MOCHA_GREP=${T_FILTER} \
    BABEL_ENV=${T_BABEL_ENV} \
    COVERAGE=${T_COVERAGE} \
    COVERAGE_OUT_HTML=${T_COVERAGE} \
    COVERAGE_OUT_LCOVONLY=${T_COVERAGE} \
    COVERAGE_APP_FOLDER="${PROJECT_PATH}/" \
    COVERAGE_VERBOSE_MODE=${T_VERBOSE} \
    meteor test \
        ${T_RUN_ONCE} \
        --driver-package=meteortesting:mocha \
        --settings=testSettings.json \
        --port=${PORT}
