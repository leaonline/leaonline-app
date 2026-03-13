#!/usr/bin/env bash

set -e

RED='\033[0;31m'
NC='\033[0m' # No Color

if ! [ $(id -u) = 0 ]; then
   echo -e "${RED}You must run this script with sudo privileges but not as root user!"
   exit 1
fi

ANDROID_HOME=/usr/lib/android-sdk
METEOR_PROJECT_PATH=$(pwd)



echo -e "Update and Upgrade System"
yes | sudo apt-get update
yes | sudo apt-get upgrade

# prepare development environment by installing JAVA-8 Version

echo -e "Install jdk/jre 8" 
yes | sudo apt-get install openjdk-8-jre
yes | sudo apt-get install openjdk-8-jdk
sudo apt update

echo -e "Install android sdk and unzip"
yes | sudo apt install android-sdk
yes | sudo apt-get install unzip

# get android studio and install

TOOLS_ZIP="tools_r25.2.3-linux"

if [ ! -d "/tmp/$TOOLS_ZIP" ]; then
    echo -e "${RED}No archive $TOOLS_ZIP found, begin download"
    cd /tmp

    # download if it does not exist
    if [ ! -f "/tmp/$TOOLS_ZIP.zip" ]; then
        wget https://dl.google.com/android/repository/${TOOLS_ZIP}.zip
    fi

    unzip ${TOOLS_ZIP}.zip
    mv ./tools ./${TOOLS_ZIP}
    cd ${METEOR_PROJECT_PATH}
else
    echo -e "${RED}Found archive $TOOLS_ZIP, skip download"
fi

if [ -d $ANDROID_HOME ]; then
    echo -e "${RED}Android home found under $ANDROID_HOME, purge existing folder"
    sudo rm -rf $ANDROID_HOME
fi

echo -e "${NC}Create new Android home under $ANDROID_HOME"
sudo mkdir $ANDROID_HOME
sudo mkdir $ANDROID_HOME/tools

echo -e "Move archive to $ANDROID_HOME"
cp -R /tmp/${TOOLS_ZIP}/* ${ANDROID_HOME}/tools
sudo chown "$SUDO_USER":"$SUDO_USER" "$ANDROID_HOME" -R

echo -e "Verify folders"

if [ ! -f "/$ANDROID_HOME/tools/android" ]; then
    echo -e "${RED}Folder integrity failed:"
    ls -la ${ANDROID_HOME}
    exit 1
fi

#setup env variables

export ANDROID_HOME=$ANDROID_HOME
export PATH=$PATH:$ANDROID_HOME/tools/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools
export ANDROID_ROOT=${ANDROID_HOME}

JAVA_HOME=/usr/lib/jvm/java-1.8.0-openjdk-amd64
PATH=$PATH:$HOME/bin:$JAVA_HOME/bin

export JAVA_HOME
export JRE_HOME
export PATH

echo -e "Set Java version to 8"
sudo update-alternatives --config java <<< '2'
sudo update-alternatives --config javac <<< '2'

if [ ! -f "$ANDROID_HOME/tools/licenses/android-sdk-license" ]; then
  echo -e "Accept Java license"
  yes | "$ANDROID_HOME"/tools/bin/sdkmanager "build-tools;25.0.2"
else
    echo -e "${RED}No license found under $ANDROID_HOME/tools/licenses/android-sdk-license"
    exit 1
fi

exit 0
