#!/usr/bin/env bash

set -e

# save the output path as absolute path
BUILD_PATH=$(realpath "$1")

# use short git commit to tag release
GIT_HASH=$(git rev-parse --short HEAD)

# use timestamp as essential part of the filemname
TIMESTAMP=$(date +%F_%T)

# this is our final filename
FILENAME="lea-app-$TIMESTAMP-$GIT_HASH.apk"

cd ./src/android/

echo "start building"
./gradlew assembleRelease

echo "move build to $BUILD_PATH/$FILENAME"
mv ./app/build/outputs/apk/release/app-release.apk "$BUILD_PATH/$FILENAME"
