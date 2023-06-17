> ## Development Environment Configuration
### Android Device Setting
  1. Activate Developer options
  2. Activate USB debugging

### Install NodeJS
  1. ```choco install -y nodejs.install```
  2. ```node --version```
  3. ```npm --version```

### Install React Native CLI
  1. ```npm install -g react-native-cli```
  2. ```npx react-native --version```

### Install JDK 8
  1. ```choco install -y jdk 8```
  2. ```java -version```

> ## Android Studio
### Configuration
  1. Install the latest version of [Android Studio](https://developer.android.com/studio)
  2. Open Android Settings via *Configure > SDK Manager* options.
  3. Change the tab to *Show Package Details*
  4. Select the following context in the list.
    - Android SDK Platform 29
    - Intel x86 Atom System Image
    - Google APIs Intel x86 Atom System Image
    - Google APIs Intel x86 Atom_64 System Image
  5. Press *Ok* to install.

> ## Environment Variable Setting
### Windows
  1. Go *System properties* page of Windows.
  2. Choice *Environment Variable(N)* in the below of popup.
  3. Press *Create(N)* buttion of *User Variable* section.
  4. Enter `ANDROID_HOME` to *Variable Name* and *The path of Android Studio SDK* to *Variable Value*.
  5. Press *Ok* to save.
  6. Find *Path* in the *User Variable* section and open it.
  7. Enter the path of *platform-tools* which is the subpath of the SDK installation folder.
  8. Press *Ok* to save.

> ## Execution
### Run Backend Server (Detector)
 - Requirements
    1. Install dependencies: `pip install -r requirements.txt`
    2. download the [best.pt](https://drive.google.com/file/d/1xGlM91if1RXCIvnAx54E6d8hk56F09li/view?usp=sharing) and put it to the backend folder.
     
```bash
BackEnd> python server.py
```

### Run Application Client (Android)
```bash
FrontEnd> npm install --force
FrontEnd> npx react-native run-android
```