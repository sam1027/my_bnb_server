# 1️⃣ 경량 Node.js LTS 버전 사용
FROM node:18-alpine

# 2️⃣ 작업 디렉토리 설정
WORKDIR /app

RUN PWD

# 3️⃣ package.json과 package-lock.json 복사
COPY package*.json ./

RUN PWD

# 4️⃣ PM2 글로벌 설치 & 의존성 설치
RUN npm install -g pm2 && npm install

# 5️⃣ 소스 코드 복사
COPY . .

RUN PWD

# 6️⃣ 컨테이너에서 실행될 포트 설정
EXPOSE 3000

# 7️⃣ PM2를 사용하여 애플리케이션 실행
CMD ["pm2-runtime", "start", "src/index.js", "--name", "practice-node-api"]
