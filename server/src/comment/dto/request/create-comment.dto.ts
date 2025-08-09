import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateCommentRequestDto {
  @ApiProperty({
    example: '댓글 내용',
    description: '댓글 내용을 입력해주세요.',
  })
  @IsString({
    message: '문자열을 입력해주세요',
  })
  @IsNotEmpty({ message: '댓글 내용을 입력하세요.' })
  comment: string;

  @ApiProperty({
    example: '1',
    description: '게시글 번호를 입력해주세요.',
  })
  @IsInt({
    message: '숫자로 입력해주세요.',
  })
  @Type(() => Number)
  feedId: number;

  constructor(partial: Partial<CreateCommentRequestDto>) {
    Object.assign(this, partial);
  }
}
