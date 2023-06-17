> ## 개발 환경 구성

### Android 기기 설정
  1. Android 기기의 **개발자 옵션**을 활성화합니다.
  2. 개발자 옵션에서 **USB 디버깅**을 활성화합니다.

### NodeJS 설치 및 버전 확인
  1. ```choco install -y nodejs.install```
  2. ```node --version```
  3. ```npm --version```

### React Native CLI 설치 및 버전 확인
  1. ```npm install -g react-native-cli```
  2. ```npx react-native --version```

### JDK 8 설치 및 버전 확인
  1. ```choco install -y jdk 8```
  2. ```java -version```

> ## 안드로이드 스튜디오 설정

### 구성
  1. 최신 [안드로이드 스튜디오](https://developer.android.com/studio) 버전을 설치하고 실행합니다.
  2. 오른쪽 하단의 *Configure > SDK Manager* 메뉴를 통해 안드로이드 설정으로 이동합니다.
  3. *Show Package Details*로 이동합니다.
  4. 목록에서 다음 내용을 선택합니다.
    - Android SDK Platform 29
    - Intel x86 Atom System Image
    - Google APIs Intel x86 Atom System Image
    - Google APIs Intel x86 Atom_64 System Image
  5. *Ok* 버튼을 눌러 선택한 패키지를 설치합니다.

> ## 환경변수 설정

### Windows
  1. *내 PC*를 우클릭 후 *속성*을 클릭합니다.
  2. *고급 시스템 설정*을 클릭합니다.
  3. 상단의 *고급* 탭 선택 후, 탭 하단의 *환경 변수* 버튼 선택합니다.
  4. 상단의 *사용자 변수* 세션의 *새로 만들기* 버튼을 선택합니다.
  5. 변수 이름으로 `ANDROID_HOME`을, 변수값에는 *안드로이드 스튜디오 SDK의 위치*를 입력 후 저장합니다.
  6. *사용자 변수* 목록에서 *Path*를 선택하여 환경 변수 편집 화면을 엽니다.
  7. 신규 값으로 이전의 SDK가 설치된 폴더 하위의 `platform-tools` 폴더 경로를 입력하고 저장합니다.

> ## 실행

### 검출 서버 실행
 - 요구 사항
    1. Python 모듈 설치: `pip install -r requirements.txt`
    2. [best.pt](https://drive.google.com/file/d/1xGlM91if1RXCIvnAx54E6d8hk56F09li/view?usp=sharing) 다운로드 및 서버 폴더로 이동

```bash
BackEnd> python server.py
```

### 어플리케이션 실행 (클라이언트)
```bash
FrontEnd> npm install --force
FrontEnd> npx react-native run-android
```