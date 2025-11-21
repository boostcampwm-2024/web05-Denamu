#!/bin/sh
set -e

# RabbitMQ 서버를 백그라운드로 시작
docker-entrypoint.sh rabbitmq-server &
RABBITMQ_PID=$!

# RabbitMQ가 완전히 준비될 때까지 대기
until rabbitmqctl list_users >/dev/null 2>&1; do
  sleep 3
done

# definitions.json import
if [ -f /etc/rabbitmq/definitions.json ]; then
  rabbitmqctl import_definitions /etc/rabbitmq/definitions.json && \
  echo "definitions.json imported successfully."
else
  echo "No definitions.json found, skipping import."
fi

# 포그라운드로 RabbitMQ 프로세스 유지
wait $RABBITMQ_PID