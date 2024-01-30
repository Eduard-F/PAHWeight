# Plan-A-Head weight

There are 2 parts to this project.
The first is the hardware that runs on raspberry pi or arduino.
The second is the react native app that connects to the hardware using wifi.

## pi_server
This contains the scripts that need to be run on the raspberry pi or adruino hardware. It requires a hx711 module with scale and wifi capability. The device can be setup to try to connect to an existing wifi and if it can't connect then it will host its own wifi hotspot that the react app can connect to. The UI and calculations used to be all arduino based but we found it is more cost effective to move most of the functionality to a cellphone especially after the raspberry pi part shortage during covid.

## React native app
The app has 3 functions, connect to the hardware, provide a UI function for user and upload the data to AWS cloud services.
Another optional function is the use of RFID/NFC tags to allow for easier selection of users/supervisors but not all phones allow for this so we also added QR code scanning functionality.

## Installation 

Install my-project with npm

```bash 
  npm install
```

## How to build/test apk
```
adb devices

cd android
gradlew bundleRelease
gradlew assembleRelease
```
