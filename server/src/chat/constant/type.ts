type ISOstring = string;

export type RedisMessagePayload = {
  messageId: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: ISOstring;
  room: string;
  deleted?: boolean;
};

export type BroadcastPayload = RedisMessagePayload;

export type AssignRoomPayload = {
  roomId: string;
  roomName: string;
};
