import { ApiProperty } from '@nestjs/swagger';

import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateUserRequestDto {
  @ApiProperty({
    example: '김개발',
    description: '변경할 사용자 이름',
    required: false,
  })
  @IsOptional()
  @IsString({
    message: '사용자 이름은 문자열이어야 합니다.',
  })
  @MaxLength(60, {
    message: '사용자 이름은 60자 이하여야 합니다.',
  })
  userName?: string;

  @ApiProperty({
    example: 'https://denamu.dev/objects/PROFILE_IMAGE/20250816/uuid.png',
    description: '변경할 프로필 이미지 path',
    required: false,
  })
  @IsOptional()
  @IsString({
    message: '프로필 이미지는 문자열이어야 합니다.',
  })
  profileImage?: string;

  @ApiProperty({
    example: '안녕하세요! 김개발입니다.',
    description: '변경할 자기소개',
    required: false,
  })
  @IsOptional()
  @IsString({
    message: '자기소개는 문자열이어야 합니다.',
  })
  @MaxLength(500, {
    message: '자기소개는 500자 이하여야 합니다.',
  })
  introduction?: string;

  constructor(partial: Partial<UpdateUserRequestDto>) {
    Object.assign(this, partial);
  }
}
