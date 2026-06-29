// AI 요약 전체 처리 구간(재요청 큐 대기 → AI 큐 대기 → Claude 요약)을 덮는
// 중복 차단 락 TTL(초). 워커 크래시 등으로 락 해제가 누락돼도 이 시간 뒤 자동 회수된다.
export const AI_RETRY_LOCK_TTL_SECONDS = 1200;
