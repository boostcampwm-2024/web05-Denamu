export type ChatType = {
  chatImg?: string;
  userName: string;
  timestamp: string;
  message: string;
  userId?: string;
  messageId?: string;
  isSend?: boolean;
  isFailed?: boolean;
  deleted?: boolean;
};

export type SendChatType = {
  message: string;
  userId: string;
  messageId: string;
};

export type AdminChatRoom = {
  roomId: string;
  roomName: string;
  messageCount: number;
  userCount: number;
};
