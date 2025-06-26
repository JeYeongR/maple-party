# Maple Party Discord Bot

함께 메이플스토리를 즐길 때 유용한 정보를 조회하는 디스코드 봇입니다.

## ✨ 주요 기능

- 캐릭터 정보 검색
- 랭킹 조회 (등록한 사용자)
- 사용자 등록

## 🔧 설치 및 설정

1. **저장소 복제**

   ```bash
   git clone https://github.com/JeYeongR/maple-party.git
   cd maple-party
   ```

2. **의존성 설치**

   ```bash
   npm install
   ```

3. **환경 변수 설정**
   `.env.sample` 파일을 복사하여 `.env` 파일을 생성하고, 아래와 같이 환경 변수를 설정합니다.

   ```
   DISCORD_TOKEN=디스코드 봇 토큰
   CLIENT_ID=디스코드 봇 클라이언트 ID
   NEXON_API_KEY=넥슨 API 키
   ```

## 🚀 사용법

1. **슬래시 커맨드 등록**

   ```bash
   node deploy-commands.js
   ```

2. **봇 실행**
   ```bash
   node index.js
   ```
