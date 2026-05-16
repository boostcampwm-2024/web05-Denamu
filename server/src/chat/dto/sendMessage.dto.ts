import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class SendMessageDto {
  @IsUUID(4, {
    message: '메세지 아이디가 없거나 UUIDv4 버전이 아닙니다.',
  })
  messageId: string;

  @IsUUID(4, {
    message: '유저 아이디가 없거나 UUIDv4 버전이 아닙니다.',
  })
  userId: string;

  @IsString()
  @IsNotEmpty({
    message: '빈 채팅은 불가능합니다.',
  })
  message: string;

  constructor(partial: Partial<SendMessageDto>) {
    Object.assign(this, partial);
  }
}
