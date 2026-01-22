FROM node:22-alpine AS builder

# 작업 디렉토리 생성 및 설정
WORKDIR /var/web05-Denamu/client

# 필요한 파일만 복사하여 캐시 활용
COPY package*.json ./

# 의존성 설치
RUN npm ci

# Runtime
# 실제 앱을 실행할 최종 이미지
FROM node:22-alpine

# 작업 디렉토리 설정
WORKDIR /var/web05-Denamu/client

# 최종 애플리케이션 코드만 복사
COPY . .

# 빌드된 node_modules만 복사
COPY --from=builder /var/web05-Denamu/client/node_modules ./node_modules

EXPOSE 5173

# 실행 명령
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]