export const MAX_CLIENTS = 500;
export const CLIENT_KEY_PREFIX = 'socket_client:';
export const CHAT_HISTORY_LIMIT = 20;

/** Redis에 저장되는 메시지 타입 (messageId 없음) */
export type RedisMessagePayload = {
  userId: string;
  userName: string;
  message: string;
  timestamp: Date; // ISO string: "2026-04-01T10:30:44.424Z"
};

/** 소켓 broadcast 타입 (messageId 포함) */
export type BroadcastPayload = RedisMessagePayload & {
  messageId: string;
};
