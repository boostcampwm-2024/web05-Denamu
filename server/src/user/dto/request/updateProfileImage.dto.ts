import { ApiProperty } from '@nestjs/swagger';

import { IsString } from 'class-validator';

export class UpdateProfileImageRequestDto {
  @ApiProperty({
    example: 'https://denamu.dev/objects/PROFILE_IMAGE/20250816/uuid.png',
    description: '변경할 프로필 이미지 path',
  })
  @IsString({
    message: '프로필 이미지는 문자열이어야 합니다.',
  })
  profileImage: string;
}
