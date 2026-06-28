#!/usr/bin/env bash
#
# Blue-Green 무중단 배포 스크립트 (prod self-hosted runner 전용)
#
#   1. 현재 active 색상 파악 (nginx active backend 파일 기준)
#   2. idle 색상 컨테이너에 신규 이미지 기동
#   3. /api/health readiness gate 통과까지 대기
#   4. nginx upstream(active backend 파일) 전환 + reload (graceful)
#   5. 구 색상 컨테이너 drain 후 stop/rm
#
# health gate 실패 시 nginx 전환을 하지 않고 종료한다.
# 구 색상이 그대로 트래픽을 받고 있으므로 사용자 영향은 0 이다.

set -euo pipefail

# ── 설정 (workflow env 로 override 가능) ──────────────────────────────
COMPOSE_FILE="${COMPOSE_FILE:?COMPOSE_FILE 미설정}"
BLUE_PORT="${BLUE_PORT:-8080}"
GREEN_PORT="${GREEN_PORT:-8081}"
ACTIVE_FILE="${ACTIVE_FILE:-/etc/nginx/conf.d/denamu_active_backend.conf}"
HEALTH_PATH="${HEALTH_PATH:-/api/health}"
HEALTH_RETRIES="${HEALTH_RETRIES:-30}"   # 30 회 x 2s = 최대 60s 대기
HEALTH_INTERVAL="${HEALTH_INTERVAL:-2}"
DRAIN_SECONDS="${DRAIN_SECONDS:-15}"      # reload 후 구 커넥션 drain 시간

compose() { docker compose -f "$COMPOSE_FILE" "$@"; }

write_active_backend() {
  # $1 = port
  echo "server 127.0.0.1:$1;" | sudo tee "$ACTIVE_FILE" >/dev/null
}

# ── 1. active backend 파일 부트스트랩 (최초 1회) ──────────────────────
if [ ! -f "$ACTIVE_FILE" ]; then
  echo "ℹ️  active backend 파일 없음 → blue($BLUE_PORT) 로 시드"
  write_active_backend "$BLUE_PORT"
fi

# ── 2. 현재 active / 배포 대상(idle) 색상 결정 ────────────────────────
CURRENT_PORT="$(grep -oE '127\.0\.0\.1:[0-9]+' "$ACTIVE_FILE" | grep -oE '[0-9]+$')"

if [ "$CURRENT_PORT" = "$BLUE_PORT" ]; then
  TARGET_COLOR="green"; TARGET_PORT="$GREEN_PORT"; OLD_SVC="app-blue"
else
  TARGET_COLOR="blue";  TARGET_PORT="$BLUE_PORT";  OLD_SVC="app-green"
fi
TARGET_SVC="app-${TARGET_COLOR}"

echo "🔵🟢 현재 active 포트=$CURRENT_PORT → 배포 대상=$TARGET_SVC(:$TARGET_PORT)"

# ── 3. idle 색상에 신규 이미지 기동 ──────────────────────────────────
compose pull "$TARGET_SVC"
compose up -d --no-deps --force-recreate "$TARGET_SVC"

# ── 4. health readiness gate ─────────────────────────────────────────
echo "⏳ health gate: http://127.0.0.1:${TARGET_PORT}${HEALTH_PATH}"
HEALTHY=0
for i in $(seq 1 "$HEALTH_RETRIES"); do
  if curl -fsS --max-time 3 "http://127.0.0.1:${TARGET_PORT}${HEALTH_PATH}" >/dev/null 2>&1; then
    HEALTHY=1
    echo "✅ health OK (${i}회차)"
    break
  fi
  sleep "$HEALTH_INTERVAL"
done

if [ "$HEALTHY" -ne 1 ]; then
  echo "❌ health gate 실패 → nginx 전환 취소. 구 버전이 계속 트래픽 처리 중."
  compose logs --tail=100 "$TARGET_SVC" || true
  compose stop "$TARGET_SVC" || true
  compose rm -f "$TARGET_SVC" || true
  exit 1
fi

# ── 5. nginx upstream 전환 (graceful reload) ─────────────────────────
echo "🔀 nginx upstream → :$TARGET_PORT 전환"
write_active_backend "$TARGET_PORT"

if ! sudo nginx -t; then
  echo "❌ nginx 설정 검증 실패 → 롤백(:$CURRENT_PORT)"
  write_active_backend "$CURRENT_PORT"
  compose stop "$TARGET_SVC" || true
  exit 1
fi
sudo systemctl reload nginx
echo "✅ nginx reload 완료. 신규 트래픽은 $TARGET_SVC 로 라우팅."

# ── 6. 구 색상 drain 후 종료 ─────────────────────────────────────────
echo "🧹 구 커넥션 drain ${DRAIN_SECONDS}s 후 $OLD_SVC 종료"
sleep "$DRAIN_SECONDS"
compose stop "$OLD_SVC" || true
compose rm -f "$OLD_SVC" || true
docker image prune -f || true

echo "🎉 Blue-Green 배포 완료: active=$TARGET_SVC(:$TARGET_PORT)"
