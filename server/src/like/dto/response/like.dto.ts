import { ApiProperty } from '@nestjs/swagger';

export class GetLikeResponseDto {
  @ApiProperty({
    example: true,
    description: '좋아요 여부',
  })
  isLike: boolean;

  private constructor(isLike: boolean) {
    this.isLike = isLike;
  }

  static toResponseDto(isLike: boolean) {
    return new GetLikeResponseDto(isLike);
  }
}
