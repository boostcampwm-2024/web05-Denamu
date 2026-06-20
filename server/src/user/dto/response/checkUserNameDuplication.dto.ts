import { ApiProperty } from '@nestjs/swagger';

export class CheckUserNameDuplicationResponseDto {
  @ApiProperty({
    example: true,
    description: '사용자 이름 존재 여부 결과',
  })
  exists: boolean;

  constructor(partial: Partial<CheckUserNameDuplicationResponseDto>) {
    Object.assign(this, partial);
  }

  static toResponseDto(checkResult: boolean) {
    return new CheckUserNameDuplicationResponseDto({
      exists: checkResult,
    });
  }
}
