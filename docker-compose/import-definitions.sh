#!/bin/sh
set -e

# RabbitMQ 서버를 백그라운드로 시작
docker-entrypoint.sh rabbitmq-server &
RABBITMQ_PID=$!

# RabbitMQ가 완전히 준비될 때까지 대기(1분 타임아웃)
MAX_WAIT=20
COUNT=0
until rabbitmqctl list_users >/dev/null 2>&1; do
  COUNT=$((COUNT + 1))
  if [ $COUNT -ge $MAX_WAIT ]; then
    echo "RabbitMQ failed to start within 60 seconds" >&2
    exit 1
  fi
  sleep 3
done

# definitions.json import
if rabbitmqctl import_definitions /etc/rabbitmq/definitions.json; then
  echo "definitions.json imported successfully."
else
  echo "Failed to import definitions.json" >&2
  exit 1
fi

# 포그라운드로 RabbitMQ 프로세스 유지
wait $RABBITMQ_PID