import { ApiTags } from '@nestjs/swagger';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { ApiResponse } from '../../common/response/common.response';
import { UserService } from '../service/user.service';
import { RegisterDto } from '../dto/request/register.dto';
import { ApiCheckEmailDuplication } from '../api-docs/check-email-duplication.api-docs';
import { ApiRegisterUser } from '../api-docs/registerUser.api-docs';
import { ApiCertificateUser } from '../api-docs/certificateUser.api-docs';
import { CertificateDto } from '../dto/request/certificate.dto';
import { CheckEmailDuplicationRequestDto } from '../dto/request/check-email-duplication.dto';
import { LoginDto } from '../dto/request/login.dto';
import { Response } from 'express';
import { ApiLoginUser } from '../api-docs/loginUser.api-docs';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiCheckEmailDuplication()
  @Get('/email-check')
  @HttpCode(HttpStatus.OK)
  async checkEmailDuplication(
    @Query()
    checkEmailDuplicationRequestDto: CheckEmailDuplicationRequestDto,
  ) {
    return ApiResponse.responseWithData(
      '이메일 중복 조회 요청이 성공적으로 처리되었습니다.',
      {
        exists: await this.userService.checkEmailDuplication(
          checkEmailDuplicationRequestDto.email,
        ),
      },
    );
  }

  @ApiRegisterUser()
  @Post('/register')
  @HttpCode(HttpStatus.CREATED)
  async registerUser(@Body() registerDto: RegisterDto) {
    await this.userService.registerUser(registerDto);
    return ApiResponse.responseWithNoContent(
      '회원가입이 요청이 성공적으로 처리되었습니다.',
    );
  }

  @ApiCertificateUser()
  @Post('/certificate')
  @HttpCode(HttpStatus.OK)
  async certificateUser(@Body() certificateDto: CertificateDto) {
    await this.userService.certificateUser(certificateDto.uuid);
    return ApiResponse.responseWithNoContent(
      '이메일 인증이 성공적으로 처리되었습니다.',
    );
  }

  @ApiLoginUser()
  @Post('/login')
  @HttpCode(HttpStatus.OK)
  async loginUser(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const accessToken = await this.userService.loginUser(loginDto, response);
    return ApiResponse.responseWithData('로그인을 성공했습니다.', accessToken);
  }
}
