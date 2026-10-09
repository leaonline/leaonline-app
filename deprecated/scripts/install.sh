#!/usr/bin/env bash

set -e

ROOT_PATH=$(pwd)
SCRIPT_DIR=$( dirname "${BASH_SOURCE[0]}" )


function print () {
    echo "[lea.online]: $1"
}


print "lea.online App-Dev install script"
print "Press CRTL+C or Command+C to cancel installation."
# ------------------------------------------------------------------------------
# check for Meteor install
# ------------------------------------------------------------------------------
print ""
print "1. Install Meteor"

INSTALL_METEOR="n"
METEOR_PATH=$(command -v meteor)

if [ ! -f "$METEOR_PATH" ]
then
  INSTALL_METEOR="y"
  print "Found no Meteor installation, do you wish to install it?"
  print "(y=yes/n=no/default=yes)"

  read -r INSTALL_METEOR_INPUT

  if [ "$INSTALL_METEOR_INPUT" == "n" ];
  then
    INSTALL_METEOR="n"
  fi
else
  print "found Meteor at '$METEOR_PATH' - skip install"
fi

# ------------------------------------------------------------------------------
# check emulators / mobile sks
# ------------------------------------------------------------------------------
print ""
print "2. Install Android"

INSTALL_ANDROID="n"

if [ ! -f "/usr/lib/android-sdk/emulator/emulator" ];
then
  print "OPTIONAL: Found no Android SDK+Emulator, do you wish to install it?"
  print "If you want to use your physical devices you can skip this option."
  print "(y=yes/n=no/default=no)"

  read -r INSTALL_ANDROID_INPUT

  if [ "$INSTALL_ANDROID_INPUT" == "y" ];
  then
    INSTALL_ANDROID="y"
  fi
else
  print "found Android emulator, skip installation"
fi

# INSTALL_IOS="n"

# ------------------------------------------------------------------------------
# Install global expo
# ------------------------------------------------------------------------------
print ""
print "3. Install expo development tools"

INSTALL_EXPO="y"

print "The mobile project uses expo for faster development, do you with to install it?"
print "(y=yes/n=no/default=yes)"

read -r INSTALL_EXPO_INPUT

if [ "$INSTALL_EXPO_INPUT" == "n" ];
then
  INSTALL_EXPO="n"
fi

# ------------------------------------------------------------------------------
# confirm installation
# ------------------------------------------------------------------------------

print "I will now install the following components:"

if [ "$INSTALL_METEOR" == "y" ]; then print ">>> Meteor"; fi
if [ "$INSTALL_ANDROID" == "y" ]; then print ">>> Android SDK+Emulator"; fi
if [ "$INSTALL_EXPO" == "y" ]; then print ">>> expo development tools"; fi

print "Please confirm this installation (y=yes/n=no/default=no)"

read -r CONFIRM_INSTALL

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
    print "Installing Meteor this may take a while"
    curl https://install.meteor.com/ | sh
fi

if [ "$INSTALL_ANDROID" == "y" ];
then
    print "Installing Android emulator, this may take a while"
    bash ${SCRIPT_DIR}/install_android_environment.sh
    bash ${SCRIPT_DIR}/install_emulator.sh
fi

if [ "$INSTALL_EXPO" == "y" ];
then
    print "Installing expo cli, this may take a while"
    meteor npm install -g expo-cli
fi

# ------------------------------------------------------------------------------
# always try to install dependencies
# ------------------------------------------------------------------------------
cd "$ROOT_PATH"
mkdir -p ../lib
cd ../lib

print "install corelib"
if [ ! -d "./corelib" ];
then
  git clone git@github.com:leaonline/corelib.git
else
  print "already found ../lib/corelib"
fi

print "install service-registry"
if [ ! -d "./service-registry" ];
then
  git clone git@github.com:leaonline/service-registry.git
else
  print "already found ../lib/service-registry"
fi

# ------------------------------------------------------------------------------
# Install node_modules if they don't exist yet
# ------------------------------------------------------------------------------

cd "$ROOT_PATH"
if [ ! -d "./backend/node_modules" ];
then
  print "install node_modules for backend"
  cd ./backend
  meteor npm install
fi

cd "$ROOT_PATH"
if [ ! -d "./src/node_modules" ];
then
  print "install node_modules for backend"
  cd ./src
  meteor npm install
fi

print "installation complete"
exit 0
