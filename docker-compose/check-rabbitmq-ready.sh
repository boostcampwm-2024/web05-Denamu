#!/bin/sh
set -e

# RabbitMQ가 실행 중인지 확인
rabbitmq-diagnostics ping > /dev/null 2>&1 || exit 1

# definitions.json의 import 성공 여부 확인
rabbitmqctl list_exchanges name | grep -q "^email$" || exit 1
rabbitmqctl list_exchanges name | grep -q "^crawling$" || exit 1

exit 0