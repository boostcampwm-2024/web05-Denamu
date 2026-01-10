import { CurrentUser } from '@common/decorator';
import { JwtGuard, Payload, RefreshJwtGuard } from '@common/guard/jwt.guard';
import { ApiResponse } from '@common/response/common.response';

import { ApiCertificateUser } from '@user/api-docs/certificateUser.api-docs';
import { ApiCheckEmailDuplication } from '@user/api-docs/checkEmailDuplication.api-docs';
import { ApiConfirmDeleteAccount } from '@user/api-docs/confirmDeleteAccount.api-docs';
import { ApiForgotPassword } from '@user/api-docs/forgotPassword.api-docs';
import { ApiLoginUser } from '@user/api-docs/loginUser.api-docs';
import { ApiLogoutUser } from '@user/api-docs/logoutUser.api-docs';
import { ApiRefreshToken } from '@user/api-docs/refreshToken.api-docs';
import { ApiRegisterUser } from '@user/api-docs/registerUser.api-docs';
import { ApiRequestDeleteAccount } from '@user/api-docs/requestDeleteAccount.api-docs';
import { ApiResetPassword } from '@user/api-docs/resetPassword.api-docs';
import { ApiUpdateUser } from '@user/api-docs/updateUser.api-docs';
import { CertificateUserRequestDto } from '@user/dto/request/certificateUser.dto';
import { CheckEmailDuplicationRequestDto } from '@user/dto/request/checkEmailDuplication.dto';
import { ConfirmDeleteAccountDto } from '@user/dto/request/confirmDeleteAccount.dto';
import { ForgotPasswordRequestDto } from '@user/dto/request/forgotPassword.dto';
import { LoginUserRequestDto } from '@user/dto/request/loginUser.dto';
import { RegisterUserRequestDto } from '@user/dto/request/registerUser.dto';
import { ResetPasswordRequestDto } from '@user/dto/request/resetPassword.dto';
import { UpdateUserRequestDto } from '@user/dto/request/updateUser.dto';
import { UserService } from '@user/service/user.service';

import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';

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
      await this.userService.checkEmailDuplication(
        checkEmailDuplicationRequestDto.email,
      ),
    );
  }

  @ApiRegisterUser()
  @Post('/register')
  @HttpCode(HttpStatus.CREATED)
  async registerUser(@Body() registerDto: RegisterUserRequestDto) {
    await this.userService.registerUser(registerDto);
    return ApiResponse.responseWithNoContent(
      '회원가입이 요청이 성공적으로 처리되었습니다.',
    );
  }

  @ApiCertificateUser()
  @Post('/certificate')
  @HttpCode(HttpStatus.OK)
  async certificateUser(@Body() certificateDto: CertificateUserRequestDto) {
    await this.userService.certificateUser(certificateDto.uuid);
    return ApiResponse.responseWithNoContent(
      '이메일 인증이 성공적으로 처리되었습니다.',
    );
  }

  @ApiLoginUser()
  @Post('/login')
  @HttpCode(HttpStatus.OK)
  async loginUser(
    @Body() loginDto: LoginUserRequestDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    return ApiResponse.responseWithData(
      '로그인을 성공했습니다.',
      await this.userService.loginUser(loginDto, response),
    );
  }

  @ApiRefreshToken()
  @Post('/refresh-token')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RefreshJwtGuard)
  refreshAccessToken(@CurrentUser() user: Payload) {
    return ApiResponse.responseWithData(
      '엑세스 토큰을 재발급했습니다.',
      this.userService.refreshAccessToken(user),
    );
  }

  @ApiLogoutUser()
  @Post('/logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtGuard)
  logoutUser(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('refresh_token');
    return ApiResponse.responseWithNoContent('로그아웃을 성공했습니다.');
  }

  @ApiUpdateUser()
  @Patch('/profile')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtGuard)
  async updateUser(
    @Body() updateUserDto: UpdateUserRequestDto,
    @CurrentUser() user: Payload,
  ) {
    await this.userService.updateUser(user.id, updateUserDto);
    return ApiResponse.responseWithNoContent(
      '사용자 프로필 정보가 성공적으로 수정되었습니다.',
    );
  }

  @ApiRequestDeleteAccount()
  @Post('/delete-account/request')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtGuard)
  async requestDeleteAccount(
    @CurrentUser() user: Payload,
    @Req() req: Request,
  ) {
    const accessToken = req.headers.authorization?.replace('Bearer ', '');
    const refreshToken = req.cookies['refresh_token'];
    await this.userService.requestDeleteAccount(
      user.id,
      accessToken,
      refreshToken,
    );
    return ApiResponse.responseWithNoContent(
      '회원탈퇴 신청이 성공적으로 처리되었습니다. 이메일을 확인해주세요.',
    );
  }

  @ApiConfirmDeleteAccount()
  @Post('/delete-account/confirm')
  @HttpCode(HttpStatus.OK)
  async confirmDeleteAccount(@Body() confirmDto: ConfirmDeleteAccountDto) {
    await this.userService.confirmDeleteAccount(confirmDto.token);
    return ApiResponse.responseWithNoContent('회원탈퇴가 완료되었습니다.');
  }

  @ApiForgotPassword()
  @Post('/password-reset')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordRequestDto) {
    await this.userService.forgotPassword(forgotPasswordDto.email);
    return ApiResponse.responseWithNoContent(
      '비밀번호 재설정 링크를 이메일로 발송했습니다.',
    );
  }

  @ApiResetPassword()
  @Patch('/password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Body() resetPasswordRequestDto: ResetPasswordRequestDto,
  ) {
    await this.userService.resetPassword(
      resetPasswordRequestDto.uuid,
      resetPasswordRequestDto.password,
    );
    return ApiResponse.responseWithNoContent(
      '비밀번호가 성공적으로 수정되었습니다.',
    );
  }
}
