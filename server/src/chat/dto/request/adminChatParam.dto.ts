import { ApiProperty } from '@nestjs/swagger';

import { IsUUID, Matches } from 'class-validator';

export class AdminChatRoomParamDto {
  @ApiProperty({
    example: 'anonymous1',
    description: '채팅방 ID',
  })
  @Matches(/^anonymous[1-9][0-9]*$/, {
    message: '존재하지 않는 채팅방입니다.',
  })
  roomId: string;
}

export class AdminChatMessageParamDto extends AdminChatRoomParamDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: '삭제할 메시지 ID',
  })
  @IsUUID(4, {
    message: '메세지 아이디가 없거나 UUIDv4 버전이 아닙니다.',
  })
  messageId: string;
}
