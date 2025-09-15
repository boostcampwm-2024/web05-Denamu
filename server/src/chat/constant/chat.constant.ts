export const MAX_CLIENTS = 500;
export const CLIENT_KEY_PREFIX = 'socket_client:';
export const CHAT_HISTORY_LIMIT = 20;
export type BroadcastPayload = {
  messageId: string;
  userId: string;
  username: string;
  message: string;
  timestamp: Date;
};
