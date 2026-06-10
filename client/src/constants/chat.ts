export const MAX_ROOM_CLIENTS = 50;

export const ANONYMOUS_ROOMS = [
  { roomId: 'anonymous1', roomName: '익명 채팅방 1' },
  { roomId: 'anonymous2', roomName: '익명 채팅방 2' },
  { roomId: 'anonymous3', roomName: '익명 채팅방 3' },
] as const;

export type AnonymousRoomId = (typeof ANONYMOUS_ROOMS)[number]['roomId'];
