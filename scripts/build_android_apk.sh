#!/usr/bin/env bash

set -e

BUILD_TYPE=$3

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
FILENAME="lea-app-$TIMESTAMP-$GIT_HASH.apk"

cd ./src/android/



if [ "$BUILD_TYPE" != 'release' ]; then
  echo "start building debug release"
  ./gradlew assembleDebug
else
  echo "start building production-like release"
	./gradlew assembleRelease
fi

echo "move build to $BUILD_PATH/$FILENAME"
mkdir -p "$BUILD_PATH"

if [ "$BUILD_TYPE" != 'release' ]; then
  mv ./app/build/outputs/apk/debug/app-debug.apk "$BUILD_PATH/$FILENAME"
else
  mv ./app/build/outputs/apk/release/app-release.apk "$BUILD_PATH/$FILENAME"
fi


echo "attempt to restore settings"
git restore ./src/lib/settings.json
