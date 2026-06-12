import { ApiProperty } from '@nestjs/swagger';

export class CheckNameDuplicationResponseDto {
  @ApiProperty({
    example: true,
    description: '이름 존재 여부 결과',
  })
  exists: boolean;

  constructor(partial: Partial<CheckNameDuplicationResponseDto>) {
    Object.assign(this, partial);
  }

  static toResponseDto(checkResult: boolean) {
    return new CheckNameDuplicationResponseDto({
      exists: checkResult,
    });
  }
}
