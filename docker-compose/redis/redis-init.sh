#!/bin/sh
set -e

echo "Starting Redis initialization..."

# 환경변수 확인
if [ -z "$REDIS_USER" ] || [ -z "$REDIS_PASSWORD" ]; then
    echo "Error: REDIS_USER or REDIS_PASSWORD not set"
    exit 1
fi

echo "REDIS_USER: $REDIS_USER"

# ACL파일이 없으면 생성
if [ ! -f /data/users.acl ]; then
    echo "Creating empty ACL file..."
    touch /data/users.acl
fi

# Redis를 설정 파일과 함께 백그라운드 시작
redis-server --daemonize yes --dir /data --aclfile /data/users.acl

# 시작 대기
sleep 8

# ACL 사용자 생성
echo "Creating ACL user..."
redis-cli ACL SETUSER "$REDIS_USER" on ">$REDIS_PASSWORD" allkeys allcommands

# ACL 설정을 파일에 저장 (이제 가능!)
redis-cli ACL SAVE
echo "ACL saved to /data/users.acl"

# 확인
redis-cli ACL LIST

# Redis 종료
redis-cli shutdown
sleep 2

# 재시작 시에도 ACL 파일 사용
echo "Starting Redis with ACL configuration..."
exec redis-server --dir /data --aclfile /data/users.acl