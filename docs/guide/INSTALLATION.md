# Installation Guide

## Notes

This project heavily utilizes Meteor and it's tech-stack so the installation
will install `Meteor` for you. Note, that Meteor already ships with NodeJs
and NPM, so you don't need them to install yourself.

However, if you have them already installed, Meteor won't mess up your
environment, so it's safe to install it.

## Prerequisites

If you don't have set up any lea.online projects you need to create
a top-level folder that will contain projects and libraries:

```bash
$ mkdir leaonline
$ cd leaonline
$ git clone git@github.com:leaonline/leaonline-app.git
```

## Use the installation script

We provide you an installation script, which you should run from your terminal:

```bash
$ cd leaonline-app
$ ./scripts/install.sh
```

> **Do not run the script with `sudo` and do not `cd` into the `scripts` directory.**

The script will ask you several questions to optimize your installation, if you
however wish to do a full manual installation, please visit the
[manual installation](docs/guide/COMMON_MANUAL_INSTALL.md) guide.

## Install content server (optional)

If you want to execute units, you need to get the [leaonline-content](https://github.com/leaonline/leaonline-content)
server and make it available to the backend.

## Run the apps

To run the apps, make sure you have installed everything first. See the prior
section on how to install.

To run the backend app, you need to do the following:

```bash
$ cd backend
$ ./run.sh
```

To run the mobile app, you need to do the following:

```bash
$ cd src
$ meteor npm run start
```

## Run the tests

We use jest (as default, defined by expo) to run the app tests and mocha to run
the backend tests.

To tun the tests on the backend, please execute the `./test.sh` script in the
`backend` project folder.

To run the tests for the app, please execute `meteor npm run test` in the app's `src`
folder.

## Documentation

We use jsDoc for api documentation of the app, as well as of the backend.
In each projects you can simply run

```bash
$ meteor npm run docs
```

The docs are generated in the output folder `docs`.


## Manual installation

### No need to install NodeJs  and NPM

You don't need to install NodeJs and NPM yourself, they will come bundled with
Meteor and the Meteor installation will not mess up your current node/npm
environment.

### Install Meteor

The app-backend is written with Meteor, please install Meteor from 
https://www.meteor.com/developers/install and follow their instructions.

After installation please try if Meteor has been successfully installed:

```bash
$ meteor
```

If you receive `command not found`, please use the following installation 
script:

```bash
$ curl https://install.meteor.com/ | sh
```

Also please check the [documentation on installation](https://docs.meteor.com/install.html)
for further troubleshooting.

### Install Expo

Expo is a direct dependency of the project, however you need the expo-cli to
run the expo developer tools, which make it very easy to access you app-build
from your mobile phone:

```bash
$ meteor npm install -g expo-cli
``` 


### Install Project dependencies

This project is split into two applications: app and backend.

To install the backend dependencies and run it, please follow these steps:

```bash
$ cd backend/
$ meteor npm install # important to use the meteor command here!
```

To install the app dependencies and run it, please follow these steps:

```bash
$ cd ../src/ # assumes you are still in <project root>/backend
$ meteor npm install
```

Now should all be set to run the app using expo.

### Optional: Install Emulators

You can run the apps in development with your physical devices. However,
if you prefer to use emulators, please follow these steps:  

#### Installation for _Android_

First of all you'll need to prepare your development environment to start the java application of lea.online.  
For that we prepared a shell script that install all necessary files.  
To run the shell script just type:

```bash
$ sudo ./install_android_environment.sh
```
After installing all necessary android files to run the emulator with lea.online, we need to create a virtual android device with:

```bash
$ sudo ./install_emulator.sh
```

Before we run our project we need to start our emulator first with:

```bash
$ /usr/lib/android-sdk/emulator/emulator -avd pixel
```

Now you can start the lea.online app on an android emulator:

```bash
$ meteor expo start 
```

After expo started just press **_a_** on your keyboard and expo will run lea.online on your previous created Android Emulator


### Installation for _iOS_

To start lea.online on an iOS Emulator you will need a MacOS operation system and the latest xcode version.

To install the emulator, just run in the `src` folder on your Mac:

```bash
$ meteor expo start
```

After expo started just press **_i_** on your keyboard and expo will run lea.online on your iOS Emulator
