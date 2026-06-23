import { ApiProperty } from '@nestjs/swagger';

export class AdminChatRoomDto {
  @ApiProperty({ example: 'anonymous1', description: '채팅방 ID' })
  roomId: string;

  @ApiProperty({ example: '익명 채팅방 1', description: '채팅방 이름' })
  roomName: string;

  @ApiProperty({ example: 12, description: '저장된 메시지 수' })
  messageCount: number;

  @ApiProperty({ example: 3, description: '현재 접속자 수' })
  userCount: number;
}

export class AdminChatMessageDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  messageId: string;

  @ApiProperty({ example: '5f...', description: '작성자 ID' })
  userId: string;

  @ApiProperty({ example: '행복한 다람쥐', description: '작성자 닉네임' })
  userName: string;

  @ApiProperty({ example: '안녕하세요', description: '메시지 내용' })
  message: string;

  @ApiProperty({ example: '2026-06-23T12:00:00.000Z' })
  timestamp: string;

  @ApiProperty({ example: 'anonymous1' })
  room: string;
}
