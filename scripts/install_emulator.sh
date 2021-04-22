#!/usr/bin/env bash

set -e

ANDROID_HOME=/usr/lib/android-sdk

sudo snap install flutter --classic
flutter doctor –android-licenses 
echo -e "Install platform image"
yes | ${ANDROID_HOME}/tools/bin/sdkmanager "system-images;android-28;google_apis;x86" #install image
# echo "no" | avdmanager --verbose create avd --force --name "pixel_8.1" --device "pixel" --package "system-images;android-27;google_apis;x86" --tag "google_apis" --abi "x86"

echo -e "Update SDK/PLattform"
#yes | ${ANDROID_HOME}/tools/android update sdk --no-ui --all --filter "sys-img-x86_64-android-28"
  echo "y" |${ANDROID_HOME}/tools/android update sdk --no-ui 
echo -e "Install abi"
  echo "y" | /usr/lib/android-sdk/tools/android update sdk -a --no-ui --filter sys-img-armeabi-v7a-android-28,sys-img-x86_64-android-28
echo -e "Install emulator"
  echo "no" | ${ANDROID_HOME}/tools/android create avd -n "pixel" -t "android-28" 
