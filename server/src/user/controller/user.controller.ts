import { ApiTags } from '@nestjs/swagger';
import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiResponse } from '../../common/response/common.response';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('/signup')
  @HttpCode(HttpStatus.ACCEPTED)
  async signupUser(@Body() signupDto: SingupDto) {
    await this.userService.signupUser(singupDto);
    return ApiResponse.responseWithNoContent(
      '회원가입이 성공적으로 처리되었습니다.',
    );
  }
}
