export type ChatType = {
  chatImg?: string;
  username: string;
  timestamp: string;
  message: string;
  isMidNight?: boolean;
  userId?: string;
  messageId?: string;
};

export type SendChatType = {
  message: string;
  userId: string;
  messageId: string;
};
