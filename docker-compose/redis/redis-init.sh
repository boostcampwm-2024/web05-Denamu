#!/bin/sh
set -e

echo "Starting Redis initialization..."

# 환경변수 확인
if [ -z "$REDIS_USER" ] || [ -z "$REDIS_PASSWORD" ]; then
    echo "Error: REDIS_USER or REDIS_PASSWORD not set"
    exit 1
fi

echo "REDIS_USER: $REDIS_USER"

ACL_FILE=/data/users.acl

# ACL파일이 없으면 생성
if [ ! -f /data/users.acl ]; then
  cat > "$ACL_FILE" <<EOF
user default off
user ${REDIS_USER} on >${REDIS_PASSWORD} ~* +@all
EOF
  echo "ACL file created at $ACL_FILE"
else
  echo "ACL file is already existed"
fi

CONF_FILE=/data/redis.conf

# CONF 파일이 없으면 생성
if [ ! -f "$CONF_FILE" ]; then
  cat > "$CONF_FILE" <<EOF
aclfile /data/users.acl
save 3600 1
save 300 100
save 60 10000
EOF
 echo "CONF file created at $CONF_FILE"
else
  echo "CONF file is already existed"
fi

exec docker-entrypoint.sh redis-server /data/redis.conf