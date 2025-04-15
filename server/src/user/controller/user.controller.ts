import { ApiTags } from '@nestjs/swagger';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiResponse } from '../../common/response/common.response';
import { UserService } from '../service/user.service';
import { SignupDto } from '../dto/request/signup.dto';
import { ApiCheckEmailDuplication } from '../api-docs/checkEmailDuplication.api-docs';
import { ApiSignupUser } from '../api-docs/signupUser.api-docs';
import { ApiCertificateUser } from '../api-docs/certificateUser.api-docs';
import { CertificateDto } from '../dto/request/certificate.dto';
import { CheckEmailDuplicationRequestDto } from '../dto/request/CheckEmailDuplcation.dto';
import { LoginDto } from '../dto/request/login.dto';
import { Response } from 'express';
import { ApiLoginUser } from '../api-docs/loginUser.api-docs';
import { JwtGuard, RefreshJwtGuard } from '../../common/guard/jwt.guard';

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

  @ApiSignupUser()
  @Post('/signup')
  @HttpCode(HttpStatus.CREATED)
  async signupUser(@Body() signupDto: SignupDto) {
    await this.userService.signupUser(signupDto);
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

  @Post('/refresh-token')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RefreshJwtGuard)
  async refreshToken(@Req() req) {
    const userInformation = req.user;
    const newAccessToken = this.userService.tokenCreate(userInformation);
    return ApiResponse.responseWithData(
      '엑세스 토큰을 재발급했습니다.',
      newAccessToken,
    );
  }

  @Post('/logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtGuard)
  async logoutUser(@Res() res: Response, @Req() req) {
    const userInformation = req.user;
    await this.userService.logoutUser(userInformation);
    res.clearCookie('refresh_token');
    return ApiResponse.responseWithNoContent('로그아웃을 성공했습니다.');
  }
}
