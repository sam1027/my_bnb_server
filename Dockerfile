# Node.js 18 LTS 기반 이미지 사용
FROM node:18

# 컨테이너 작업 디렉토리 설정
WORKDIR /app

# package.json 및 package-lock.json 복사
COPY package*.json ./

# 의존성 설치
RUN npm install

# 소스 코드 복사
COPY . .  

# TypeScript 프로젝트라면 빌드 실행
RUN npm run build

# PM2로 실행
CMD ["npx", "pm2-runtime", "dist/index.js"]
