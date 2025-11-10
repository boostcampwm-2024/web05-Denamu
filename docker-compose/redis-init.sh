#!/bin/sh

# Redis 서버를 백그라운드에서 시작
redis-server --daemonize yes

# Redis가 완전히 시작될 때까지 대기
sleep 5

# 환경변수를 사용하여 ACL 사용자 생성
# 컨테이너 내부에서 실행되므로 env_file로 주입된 환경변수 사용 가능
if [ -n "$REDIS_USER" ] && [ -n "$REDIS_PASSWORD" ]; then
    echo "ACL SETUSER $REDIS_USER on >$REDIS_PASSWORD allkeys allcommands" | redis-cli
    echo "Redis ACL user created: $REDIS_USER"
else
    echo "Warning: REDIS_USER or REDIS_PASSWORD not set"
fi

# 포그라운드로 Redis 재시작 (컨테이너가 종료되지 않도록)
redis-cli shutdown
exec redis-server
