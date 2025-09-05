import { ApiProperty } from '@nestjs/swagger';

export class CreateAccessTokenResponseDto {
  @ApiProperty({
    example: 'exampleJWTAccessToken',
    description: '엑세스 토큰',
  })
  accessToken: string;

  private constructor(partial: Partial<CreateAccessTokenResponseDto>) {
    Object.assign(this, partial);
  }

  static toResponseDto(accessToken: string) {
    return new CreateAccessTokenResponseDto({
      accessToken,
    });
  }
}
