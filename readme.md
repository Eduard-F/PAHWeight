keytool -genkeypair -v -storetype PKCS12 -keystore my-upload-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
a1b2c3d4e5

adb devices

cd android
gradlew bundleRelease
gradlew assembleRelease