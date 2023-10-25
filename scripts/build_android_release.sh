#!/usr/bin/env bash

set -e

LEA_ROOT_PATH=$(pwd)

# first of all validate settings schema
cat $2 > ./src/lib/settings.json
node ./src/prePublish.js || {
  git restore ./src/lib/settings.json
  exit 1
}

# save the output path as absolute path
BUILD_PATH=$(realpath "$1")

# use short git commit to tag release
GIT_HASH=$(git rev-parse --short HEAD)

# use timestamp as essential part of the filemname
TIMESTAMP=$(date +%F-%T | sed -r 's/[:]+/-/g')

# this is our final filename
FILENAME="lea-app-$TIMESTAMP-$GIT_HASH.aab"

cd "$LEA_ROOT_PATH/src/android/"

echo "start building"
./gradlew bundleRelease

echo "move build to $BUILD_PATH/$FILENAME"
mkdir -p "$BUILD_PATH"
mv ./app/build/outputs/bundle/release/app-release.aab "$BUILD_PATH/$FILENAME"

git restore "$LEA_ROOT_PATH/src/lib/settings.json"
