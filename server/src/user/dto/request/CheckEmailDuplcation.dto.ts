import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CheckEmailDuplicationRequestDto {
  @ApiProperty({
    example: 'test1234@test.com',
    description: '중복 확인할 이메일을 입력해주세요.',
  })
  @IsEmail({}, { message: '이메일 형식이 아닙니다.' })
  @IsNotEmpty({ message: '이메일을 입력해주세요.' })
  @Type(() => String)
  email: string;
}
