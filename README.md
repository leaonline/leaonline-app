# leaonline-app

To run the leaonline app you need to install the dependencies first with:  

``` 
npm install 
```


**Installation for _Android_**

First of all you'll need to prepare your development environment to start the java application of leaonline.  
For that we prepared a shell script that install all necessary files.  
To run the shell script just type:

```
sudo ./install_android_environment.sh
```
After installing all necessary android files to run the emulator with leaonline, we need to create a virtual android device with:

```
sudo ./install_emulator.sh
```

Before we run our project we need to start out emulator first with:
```
/usr/lib/android-sdk/emulator/emulator -avd pixel
```

Now you can start the leaonline app on an android emulator:

```
expo start 
```

After expo started just press **_a_** on your keyboard and expo will run leaonline on your previous created Android Emulator


**Installation for _iOS_** 

To start leaonline on an iOS Emulator you will need an macOS operation system and the latest xcode version.  
Just run the following:

```
expo start
```

After expo started just press **_i_** on your keyboard and expo will run leaonline on your iOS Emulator
