import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { Response } from 'express';

import { CurrentUser } from '@common/decorator';
import { JwtGuard, Payload, RefreshJwtGuard } from '@common/guard/jwt.guard';
import { ApiResponse } from '@common/response/common.response';

import { ApiCertificateUser } from '@user/api-docs/certificateUser.api-docs';
import { ApiCheckEmailDuplication } from '@user/api-docs/checkEmailDuplication.api-docs';
import { ApiCheckNameDuplication } from '@user/api-docs/checkNameDuplication.api-docs';
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
import { CheckNameDuplicationRequestDto } from '@user/dto/request/checkNameDuplication.dto';
import { ConfirmDeleteAccountParamRequestDto } from '@user/dto/request/confirmDeleteAccountParam.dto';
import { ForgotPasswordRequestDto } from '@user/dto/request/forgotPassword.dto';
import { LoginUserRequestDto } from '@user/dto/request/loginUser.dto';
import { RegisterUserRequestDto } from '@user/dto/request/registerUser.dto';
import { ResetPasswordRequestDto } from '@user/dto/request/resetPassword.dto';
import { ResetPasswordParamRequestDto } from '@user/dto/request/resetPasswordParam.dto';
import { UpdateUserRequestDto } from '@user/dto/request/updateUser.dto';
import { UserService } from '@user/service/user.service';

@ApiTags('User')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiCheckEmailDuplication()
  @Get('/email-availability')
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

  @ApiCheckNameDuplication()
  @Get('/name-availability')
  @HttpCode(HttpStatus.OK)
  async checkNameDuplication(
    @Query()
    checkNameDuplicationRequestDto: CheckNameDuplicationRequestDto,
  ) {
    return ApiResponse.responseWithData(
      '닉네임 중복 조회 요청이 성공적으로 처리되었습니다.',
      await this.userService.checkNameDuplication(
        checkNameDuplicationRequestDto.userName,
      ),
    );
  }

  @ApiRegisterUser()
  @Post('/registrations')
  @HttpCode(HttpStatus.CREATED)
  async registerUser(@Body() registerDto: RegisterUserRequestDto) {
    await this.userService.registerUser(registerDto);
    return ApiResponse.responseWithNoContent(
      '회원가입이 요청이 성공적으로 처리되었습니다.',
    );
  }

  @ApiCertificateUser()
  @Post('/email-verifications')
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
  @Post('/tokens')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RefreshJwtGuard)
  refreshAccessToken(
    @CurrentUser() user: Payload,
    @Res({ passthrough: true }) response: Response,
  ) {
    return ApiResponse.responseWithData(
      '엑세스 토큰을 재발급했습니다.',
      this.userService.refreshAccessToken(user, response),
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
  @Post('/deletion-requests')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtGuard)
  async requestDeleteAccount(@CurrentUser() user: Payload) {
    await this.userService.requestDeleteAccount(user.id);
    return ApiResponse.responseWithNoContent(
      '회원탈퇴 신청이 성공적으로 처리되었습니다. 이메일을 확인해주세요.',
    );
  }

  @ApiConfirmDeleteAccount()
  @Delete('/deletion-requests/:token')
  @HttpCode(HttpStatus.OK)
  async confirmDeleteAccount(
    @Param() paramDto: ConfirmDeleteAccountParamRequestDto,
  ) {
    await this.userService.confirmDeleteAccount(paramDto.token);
    return ApiResponse.responseWithNoContent('회원탈퇴가 완료되었습니다.');
  }

  @ApiForgotPassword()
  @Post('/password-resets')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordRequestDto) {
    await this.userService.forgotPassword(forgotPasswordDto.email);
    return ApiResponse.responseWithNoContent(
      '비밀번호 재설정 링크를 이메일로 발송했습니다.',
    );
  }

  @ApiResetPassword()
  @Patch('/password-resets/:uuid')
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Param() paramDto: ResetPasswordParamRequestDto,
    @Body() resetPasswordRequestDto: ResetPasswordRequestDto,
  ) {
    await this.userService.resetPassword(
      paramDto.uuid,
      resetPasswordRequestDto.password,
    );
    return ApiResponse.responseWithNoContent(
      '비밀번호가 성공적으로 수정되었습니다.',
    );
  }
}
