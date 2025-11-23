#!/bin/sh
set -e

# RabbitMQ가 실행 중인지 확인
rabbitmq-diagnostics ping > /dev/null 2>&1 || exit 1

# definitions.json의 import 성공 여부 확인
# ⚠️ 주의: 아래의 exchange 이름(email, crawling)은 definitions.json 파일의 exchanges 항목과 반드시 동기화되어야 합니다.
# definitions.json에서 exchange를 추가/삭제할 경우, 이 스크립트도 반드시 함께 수정해야 합니다.
rabbitmqctl list_exchanges name | grep -q "^email$" || exit 1
rabbitmqctl list_exchanges name | grep -q "^crawling$" || exit 1

exit 0