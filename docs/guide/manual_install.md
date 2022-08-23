# Manual installation

## No need to install NodeJs  and NPM

You don't need to install NodeJs and NPM yourself, they will come bundled with
Meteor and the Meteor installation will not mess up your current node/npm
environment.

## Install Meteor

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

## Install Expo

Expo is a direct dependency of the project, however you need the expo-cli to
run the expo developer tools, which make it very easy to access you app-build
from your mobile phone:

```bash
$ meteor npm install -g expo-cli
``` 


## Install Project dependencies

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

## Optional: Install Emulators

You can run the apps in development with your physical devices. However,
if you prefer to use emulators, please follow these steps:  

### Installation for _Android_

First of all you'll need to prepare your development environment to start the java application of lea.online.  
For that we prepared a shell script that install all necessary files.  
To run the shell script just type:

```
sudo ./install_android_environment.sh
```
After installing all necessary android files to run the emulator with lea.online, we need to create a virtual android device with:

```
sudo ./install_emulator.sh
```

Before we run our project we need to start our emulator first with:
```
/usr/lib/android-sdk/emulator/emulator -avd pixel
```

Now you can start the lea.online app on an android emulator:

```
meteor expo start 
```

After expo started just press **_a_** on your keyboard and expo will run lea.online on your previous created Android Emulator


## Installation for _iOS_

To start lea.online on an iOS Emulator you will need an macOS operation system and the latest xcode version.  
Just run the following:

```
meteor  expo start
```

After expo started just press **_i_** on your keyboard and expo will run lea.online on your iOS Emulator
