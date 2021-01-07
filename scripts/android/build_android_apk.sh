#!/usr/bin/env bash

METEOR_PROJECT_PATH=$(pwd)
SERVER="${APPLICATION_NAME}.meteor.com"
APPLICATION_NAME="$(basename "$METEOR_PROJECT_PATH")_apk"

cd "${METEOR_PROJECT_PATH}"/../.. || exit


meteor add-platform android
meteor build "${APPLICATION_NAME}" --server="${SERVER}"


