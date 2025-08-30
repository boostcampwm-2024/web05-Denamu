import { ApiTags } from '@nestjs/swagger';
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
import { ApiResponse } from '../../common/response/common.response';
import { UserService } from '../service/user.service';
import { RegisterUserRequestDto } from '../dto/request/registerUser.dto';
import { ApiCheckEmailDuplication } from '../api-docs/checkEmailDuplication.api-docs';
import { ApiRegisterUser } from '../api-docs/registerUser.api-docs';
import { ApiCertificateUser } from '../api-docs/certificateUser.api-docs';
import { CertificateUserRequestDto } from '../dto/request/certificateUser.dto';
import { CheckEmailDuplicationRequestDto } from '../dto/request/checkEmailDuplication.dto';
import { LoginUserRequestDto } from '../dto/request/loginUser.dto';
import { Response } from 'express';
import { ApiLoginUser } from '../api-docs/loginUser.api-docs';
import { JwtGuard, RefreshJwtGuard } from '../../common/guard/jwt.guard';
import { ApiRefreshToken } from '../api-docs/refreshUser.api-docs';
import { ApiLogoutUser } from '../api-docs/logoutUser.api-docs';
import { UpdateUserRequestDto } from '../dto/request/updateUser.dto';
import { ApiUpdateUser } from '../api-docs/updateUser.api-docs';

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
    const accessToken = await this.userService.loginUser(loginDto, response);
    return ApiResponse.responseWithData('로그인을 성공했습니다.', {
      accessToken,
    });
  }

  @ApiRefreshToken()
  @Post('/refresh-token')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RefreshJwtGuard)
  async refreshAccessToken(@Req() req) {
    const userInformation = req.user;
    return ApiResponse.responseWithData(
      '엑세스 토큰을 재발급했습니다.',
      this.userService.createToken(userInformation, 'access'),
    );
  }

  @ApiLogoutUser()
  @Post('/logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtGuard)
  async logoutUser(@Res({ passthrough: true }) res) {
    res.clearCookie('refresh_token');
    return ApiResponse.responseWithNoContent('로그아웃을 성공했습니다.');
  }

  @ApiUpdateUser()
  @Patch('/profile')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtGuard)
  async updateUser(@Body() updateUserDto: UpdateUserRequestDto, @Req() req) {
    await this.userService.updateUser(req.user.id, updateUserDto);
    return ApiResponse.responseWithNoContent(
      '사용자 프로필 정보가 성공적으로 수정되었습니다.',
    );
  }
}
