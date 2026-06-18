import { ApiProperty } from '@nestjs/swagger';

import { IsBoolean, IsOptional } from 'class-validator';

export class RequestDeleteAccountRequestDto {
  @ApiProperty({
    example: true,
    description:
      '회원 탈퇴 시 소유한 RSS도 함께 삭제할지 여부입니다. 생략하거나 true이면 소유 RSS(및 연관 피드)가 함께 삭제되고, false이면 RSS는 유지하고 소유 연결만 해제합니다.',
    required: false,
    default: true,
  })
  @IsOptional()
  @IsBoolean({
    message: 'deleteRss는 boolean으로 입력해주세요.',
  })
  deleteRss?: boolean = true;

  constructor(partial: Partial<RequestDeleteAccountRequestDto>) {
    Object.assign(this, partial);
  }
}
