type ISOstring = string;

/** Redis에 저장되는 메시지 타입 (messageId 없음) */
export type RedisMessagePayload = {
  userId: string;
  userName: string;
  message: string;
  timestamp: ISOstring;
};

/** 소켓 broadcast 타입 (messageId 포함 ＊ 클라이언트 측 메세지 전달 여부 ACK) */
export type BroadcastPayload = RedisMessagePayload & {
  messageId: string;
};
