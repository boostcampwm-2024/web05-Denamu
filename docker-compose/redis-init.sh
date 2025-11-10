#!/bin/sh
set -e

# Redis 서버를 백그라운드에서 시작
redis-server --daemonize yes

# Redis가 완전히 시작될 때까지 대기
sleep 5

# 환경변수를 사용하여 ACL 사용자 생성
# 컨테이너 내부에서 실행되므로 env_file로 주입된 환경변수 사용 가능
if [ -n "$REDIS_USER" ] && [ -n "$REDIS_PASSWORD" ]; then
    # heredoc을 사용하여 비밀번호 노출 방지
    if redis-cli <<EOF
ACL SETUSER $REDIS_USER on >$REDIS_PASSWORD allkeys allcommands
ACL SAVE
EOF
    then
        echo "Redis ACL user created and saved: $REDIS_USER"
    else
        echo "Error: Failed to create Redis ACL user"
        exit 1
    fi
else
    echo "Warning: REDIS_USER or REDIS_PASSWORD not set"
    echo "Error: Redis credentials are required"
    exit 1
fi

# ACL 설정이 완료되었으므로 Redis를 안전하게 종료
redis-cli shutdown
# Redis가 완전히 종료될 때까지 대기
sleep 2

# 포그라운드로 Redis 재시작 (컨테이너가 종료되지 않도록)
exec redis-server
