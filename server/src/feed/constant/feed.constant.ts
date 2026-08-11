// 중복 차단 락 TTL(초). 정상 흐름은 성공/영구실패 시점에 명시적으로 해제되므로
// 이 값은 정상 처리 시간과 무관하다 — 워커 크래시, AI 큐 파싱 실패 등으로
// 명시적 해제가 아예 불가능해진 경우에만 개입하는 최후 안전망이라 넉넉하게 잡는다. (2시간)
export const AI_RETRY_LOCK_TTL_SECONDS = 7200;

export const FEED_AI_SUMMARY_IN_PROGRESS_MESSAGE = `아직 AI가 요약을 진행중인 게시글 이에요! 💭`;
