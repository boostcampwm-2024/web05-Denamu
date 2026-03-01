export type ChatType = {
  chatImg?: string;
  username: string;
  timestamp: string;
  message: string;
  isMidNight?: boolean;
  userId?: string;
  messageId?: string;
  isSend?: boolean;
  isFailed?: boolean;
};

export type SendChatType = {
  message: string;
  userId: string;
  messageId: string;
};
