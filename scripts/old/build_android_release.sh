#!/usr/bin/env bash

set -e

LEA_ROOT_PATH=$(pwd)
echo "Root path is $LEA_ROOT_PATH"

# first of all validate settings schema
cat $2 > "$LEA_ROOT_PATH/src/lib/settings.json"

node ./src/prePublish.js || {
  git restore ./src/lib/settings.json
  exit 1
}

echo "Using this app settings file: $2"
cat "$LEA_ROOT_PATH/src/lib/settings.json"

# save the output path as absolute path
BUILD_PATH=$(realpath "$1")
echo "Build path is $BUILD_PATH"

# use short git commit to tag release
GIT_HASH=$(git rev-parse --short HEAD)
echo "Git hash is $GIT_HASH"

# use timestamp as essential part of the filemname
TIMESTAMP=$(date +%F-%T | sed -r 's/[:]+/-/g')
echo "Timestamp is $TIMESTAMP"

# this is our final filename
FILENAME="lea-app-production-$TIMESTAMP-$GIT_HASH.aab"

cd "$LEA_ROOT_PATH/src/android/"

echo "Start building:"
./gradlew bundleRelease

echo "Complete, move build to $BUILD_PATH/$FILENAME"
mkdir -p "$BUILD_PATH"
mv ./app/build/outputs/bundle/release/app-release.aab "$BUILD_PATH/$FILENAME"

echo "Restore settings"
git restore "$LEA_ROOT_PATH/src/lib/settings.json"

echo "All done!"
