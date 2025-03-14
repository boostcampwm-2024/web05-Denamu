import { ApiTags } from '@nestjs/swagger';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
} from '@nestjs/common';
import { ApiResponse } from '../../common/response/common.response';
import { UserService } from '../service/user.service';
import { SignupDto } from '../dto/request/signup.dto';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/email-check')
  @HttpCode(HttpStatus.OK)
  async checkEmailDuplication(@Query('email') email: string) {
    return ApiResponse.responseWithData(
      '이메일 중복 조회 요청이 성공적으로 처리되었습니다.',
      {
        exists: await this.userService.checkEmailDuplication(email),
      },
    );
  }

  @Post('/signup')
  @HttpCode(HttpStatus.CREATED)
  async signupUser(@Body() signupDto: SignupDto) {
    this.userService.signupUser(signupDto);
    return ApiResponse.responseWithNoContent(
      '회원가입이 요청이 성공적으로 처리되었습니다.',
    );
  }

  @Post('/certificate')
  @HttpCode(HttpStatus.OK)
  async certificateUser(@Body() uuid: string) {
    await this.userService.certificateUser(uuid);
    return ApiResponse.responseWithNoContent(
      '이메일 인증이 성공적으로 처리되었습니다.',
    );
  }
}
