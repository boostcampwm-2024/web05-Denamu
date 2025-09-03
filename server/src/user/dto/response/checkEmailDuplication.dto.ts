import { ApiProperty } from '@nestjs/swagger';

export class CheckEmailDuplicationResponseDto {
  @ApiProperty({
    example: true,
    description: '이메일 존재 여부 결과',
  })
  exists: boolean;

  private constructor(partial: Partial<CheckEmailDuplicationResponseDto>) {
    Object.assign(this, partial);
  }

  static toResponseDto(checkResult: boolean) {
    return new CheckEmailDuplicationResponseDto({
      exists: checkResult,
    });
  }
}
