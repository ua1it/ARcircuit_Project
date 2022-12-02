> 개발환경 구축
### 초기 설정
1. Node js LTS버전으로 설치
2. vsCode 설치
3. Git 설치
4. git clone https://github.com/jomo34/Safety_management_Project.git
5. 삼성 통합 드라이버 설치 후 ADB Tool 다운로드(https://kibua20.tistory.com/165)
6. 자바 버전 확인 및 환경변수 설정(16.0.2 사용)
7. Gradle 설치 및 GRADLE_HOME 환경변수 설정(https://thecodinglog.github.io/gradle/2019/09/11/install-gradle-in-windows.html)

### node.js 서버 구축
cmd창에서 아래 명령어를 통해 node.js서버 구동에 필요한 모듈을 설치한다.
```
cd Safety_management_Project
cd Express_Backend
npm i
```
Express_Backend\src\db_config.js 
```
var mysql = require("mysql");
var db = mysql.createConnection({
  host: "121.190.16.109",
  user: "sbrtls_gachon",
  password: "ake0231zw82dp",
  database: "sbrtls",
});
db.connect();
module.exports = db;
```
그 후 `node app` 명령어를 통해 서버를 실행한다.

***

### React native 앱 시작
cmd창에서 아래 명령어를 통해 로그인 앱 구동에 필요한 모듈을 설치한다.
```
cd Safety_management_Project
cd Mobile_Frontend
npm i
```

```
cd android
gradlew wrapper --gradle-version=7.1.1
```
Mobile_Frontend\src\user.js
```
const ip = 'http://자신의 IP:4000/';

module.exports = ip;
```
그 후 `npm start`를 통해 React native 앱을 안드로이드 에뮬레이터나 컴퓨터와 연결된 안드로이드 휴대폰에 로드해준다.

***
### 오류 목록
✔ npm i 오류시 npm i --legacy-peer-deps <br>
✔ The minCompileSdk (31) specified in a ... 오류시 Mobile_Frontend/android/build.gradle 파일의 compileSDKVersion과 targetSdkVersion을 31로 변경<br>
✔ NDK at ~/Android/sdk/ndk~~~~ did not have a source.properties file 오류시 해당 루트로 가서 폴더 삭제 후 재실행<br>
✔ react-native-reanimated not found CMake 오류시 https://www.youtube.com/watch?v=65IQjSq6QMo 참고<br>
