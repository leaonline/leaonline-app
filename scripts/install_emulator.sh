#!/usr/bin/env bash

ANDROID_HOME=/usr/lib/android-sdk

/usr/lib/android-sdk/tools/tools/bin/sdkmanager "system-images;android-28;google_apis;x86" #install image

# echo "no" | avdmanager --verbose create avd --force --name "pixel_8.1" --device "pixel" --package "system-images;android-27;google_apis;x86" --tag "google_apis" --abi "x86"
/usr/lib/android-sdk/tools/tools/android update sdk --no-ui --all --filter "sys-img-x86_64-android-28"
/usr/lib/android-sdk/tools/tools/android create avd -n "pixel" -t "android-28"



