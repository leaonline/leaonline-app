#!/usr/bin/env bash

set -e

SCRIPT_DIR=$( dirname "${BASH_SOURCE[0]}" )


function print () {
    echo "[lea.online]: $1"
}


print "lea.online App-Dev install script"
print "Press CRTL+C or Command+C to cancel installation."


# ------------------------------------------------------------------------------
# check for Meteor install
# ------------------------------------------------------------------------------

INSTALL_METEOR="y"

if command -v meteor &> /dev/null
then
  print "Found no Meteor installation, do you with to install it?"
  print "(y=yes/n=no/default=yes)"

  read INSTALL_METEOR_INPUT

  if [ "$INSTALL_METEOR_INPUT" == "n" ];
  then
    INSTALL_METEOR="n"
  fi
fi

# ------------------------------------------------------------------------------
# check emulators / mobile sks
# ------------------------------------------------------------------------------

INSTALL_ANDROID="n"

if [ -f "/usr/lib/android-sdk/emulator/emulator" ];
then
  print "OPTIONAL: Found no Android SDK+Emulator, do you with to install it?"
  print "If you want to use your physical devices you can skip this option."
  print "(y=yes/n=no/default=no)"

  read INSTALL_ANDROID_INPUT

  if [ "$INSTALL_ANDROID_INPUT" == "y" ];
  then
    INSTALL_ANDROID="y"
  fi
fi

INSTALL_IOS="n"

# ------------------------------------------------------------------------------
# confirm installation
# ------------------------------------------------------------------------------

print "I will now install the following components:"

if [ "$INSTALL_METEOR" == "y" ]; then print ">>> Meteor"; fi
if [ "$INSTALL_ANDROID" == "y" ]; then print ">>> Android SDK+Emulator"; fi

print "Please confirm this installation (y=yes/n=no/default=no)"

read CONFIRM_INSTALL

if [ "$CONFIRM_INSTALL" != "y" ];
then
    print "installation cancelled"
    exit 1
fi

# ------------------------------------------------------------------------------
# installation
# ------------------------------------------------------------------------------

if [ "$INSTALL_METEOR" == "y" ];
then
    curl https://install.meteor.com/ | sh
fi

if [ "$INSTALL_ANDROID" == "y" ];
then
    bash ${SCRIPT_DIR}/install_android_environment.sh
    bash ${SCRIPT_DIR}/install_emulator.sh
fi

print "installation complete"
exit 0
