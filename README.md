> 개발환경 구축
### 초기 설정
- Android Device Setting
  1. Android 기기에서 설정을 열고 휴대전화 정보를 검색합니다.
  2. 휴대전화 정보를 탭하고 빌드 번호를 일곱 번 탭합니다. 메시지가 표시되면 기기 비밀번호 또는 PIN을 입력합니다.
  3. 설정으로 돌아가서 시스템을 탭합니다. 이제 개발자 옵션이 목록에 표시됩니다. 고급 옵션을 열어 찾아야 할 수도 있습니다.
  4. 개발자 옵션을 탭하여 USB 디버깅을 사용 설정합니다.

- NodeJS 설치 및 버전 확인
  1. ```choco install -y nodejs.install```
  2. ```node --version```
  3. ```npm --version```

- React Native Cli 설치 및 버전 확인
  1. ```npm install -g react-native-cli```
  2. ```npx react-native --version```

- JDK 설치 및 버전 확인
  1. ```choco install -y jdk 8```
  2. ```java -version```

- 안드로이드 스튜디오 설정
  1. 안드로이드 스튜디오 latest 버전을 설치합니다.
  2. 안드로이드 스튜디오 실행 후, 오른쪽 하단의 Configure > SDK Manager를 선택하여 안드로이드 설정 화면으로 이동합니다.
  3. Show Package Details로 이동합니다.
  4. 리스트에서 아래의 내용을 찾아 선택합니다.
    - Android SDK Platform 29
    - Intel x86 Atom System Image
    - Google APIs Intel x86 Atom System Image
    - Google APIs Intel x86 Atom_64 System Image
  5. 오른쪽 하단의 OK 버튼을 눌러 선택한 내용을 설치합니다.

- 환경변수 설정
  1. 내 PC 우클릭 후 속성 클릭합니다.
  2. 고급 시스템 설정 클릭합니다.
  3. 상단에 있는 고급탭 선택 후, 고급탭 하단에 있는 환경 변수 버튼 선택합니다.
  4. 상단에 있는 사용자 변수 섹션의 새로 만들기 버튼을 선택합니다.
  5. 새 환경 변수 추가 화면이 나오면 변수 이름에는 ANDROID_HOME을 입력하고, 변수값에는 자신의 안드로이드 스튜디오 SDK위치를 입력 후 생성합니다.
  6. 사용자 변수 리스트에서 Path를 선택하여 환경 변수 편집 화면으로 이동합니다.
  7. 아까 만든 환경변수를 편집하여 SDK가 설치된 폴더 하위에 있는 platform-tools폴더 경로를 입력하고 확인 버튼을 눌러 환경 변수를 수정합니다.

- ```git clone https://github.com/jomo34/Safety_management_Project.git```


## 실행방법
### Terminal 1st, BackEnd 실행
  1. pip install -r requirements.txt
  2. download best.pt file and copy in this file(download path: https://drive.google.com/file/d/1xGlM91if1RXCIvnAx54E6d8hk56F09li/view?usp=sharing)
     
```BackEnd> python server.py```
### Terminal 2nd, FrontEnd 실행
```
FrontEnd> npm i --f
FrontEnd> npx react-native run-android
```
