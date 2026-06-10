export type ChatType = {
  chatImg?: string;
  userName: string;
  timestamp: string;
  message: string;
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
