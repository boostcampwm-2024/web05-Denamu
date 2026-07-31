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
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { Request, Response } from 'express';

import { ApiCertificateAdmin } from '@admin/api-docs/certificateAdmin.api-docs';
import { ApiConfirmDeleteAdmin } from '@admin/api-docs/confirmDeleteAdmin.api-docs';
import { ApiDeleteChildAdmin } from '@admin/api-docs/deleteChildAdmin.api-docs';
import { ApiForgotPasswordAdmin } from '@admin/api-docs/forgotPasswordAdmin.api-docs';
import { ApiGetChildrenAdmin } from '@admin/api-docs/getChildrenAdmin.api-docs';
import { ApiGetCurrentAdmin } from '@admin/api-docs/getCurrentAdmin.api-docs';
import { ApiLoginAdmin } from '@admin/api-docs/loginAdmin.api-docs';
import { ApiLogoutAdmin } from '@admin/api-docs/logoutAdmin.api-docs';
import { ApiRegisterAdmin } from '@admin/api-docs/registerAdmin.api-docs';
import { ApiRequestDeleteAdmin } from '@admin/api-docs/requestDeleteAdmin.api-docs';
import { ApiResetPasswordAdmin } from '@admin/api-docs/resetPasswordAdmin.api-docs';
import { ApiUpdateAdminProfile } from '@admin/api-docs/updateAdminProfile.api-docs';
import { CertificateAdminRequestDto } from '@admin/dto/request/certificateAdmin.dto';
import { ConfirmDeleteAdminParamRequestDto } from '@admin/dto/request/confirmDeleteAdminParam.dto';
import { DeleteChildAdminParamRequestDto } from '@admin/dto/request/deleteChildAdminParam.dto';
import { ForgotPasswordAdminRequestDto } from '@admin/dto/request/forgotPasswordAdmin.dto';
import { LoginAdminRequestDto } from '@admin/dto/request/loginAdmin.dto';
import { RegisterAdminRequestDto } from '@admin/dto/request/registerAdmin.dto';
import { ResetPasswordAdminRequestDto } from '@admin/dto/request/resetPasswordAdmin.dto';
import { ResetPasswordAdminParamRequestDto } from '@admin/dto/request/resetPasswordAdminParam.dto';
import { UpdateAdminProfileRequestDto } from '@admin/dto/request/updateAdminProfile.dto';
import { AdminService } from '@admin/service/admin.service';

import { CurrentAdmin } from '@common/decorator/current-admin.decorator';
import { AdminAuthGuard } from '@common/guard/session.guard';
import { ApiResponse } from '@common/response/common.response';

@ApiTags('Admin')
@Controller('admins')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @ApiLoginAdmin()
  @Post('/login')
  @HttpCode(HttpStatus.OK)
  async loginAdmin(
    @Body() loginAdminBodyDto: LoginAdminRequestDto,
    @Res({ passthrough: true }) response: Response,
    @Req() request: Request,
  ) {
    await this.adminService.loginAdmin(loginAdminBodyDto, response, request);
    return ApiResponse.responseWithNoContent(
      '로그인이 성공적으로 처리되었습니다.',
    );
  }

  @ApiLogoutAdmin()
  @UseGuards(AdminAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('/logout')
  async logoutAdmin(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.adminService.logoutAdmin(request, response);
    return ApiResponse.responseWithNoContent(
      '로그아웃이 성공적으로 처리되었습니다.',
    );
  }

  @ApiRegisterAdmin()
  @UseGuards(AdminAuthGuard)
  @Post('/registrations')
  @HttpCode(HttpStatus.CREATED)
  async registerAdmin(
    @Body() registerAdminBodyDto: RegisterAdminRequestDto,
    @CurrentAdmin() email: string,
  ) {
    await this.adminService.registerAdmin(registerAdminBodyDto, email);
    return ApiResponse.responseWithNoContent(
      '관리자 계정 생성 요청이 성공적으로 처리되었습니다. 이메일을 확인해주세요.',
    );
  }

  @ApiCertificateAdmin()
  @Post('/email-verifications')
  @HttpCode(HttpStatus.OK)
  async certificateAdmin(
    @Body() certificateAdminBodyDto: CertificateAdminRequestDto,
  ) {
    await this.adminService.certificateAdmin(certificateAdminBodyDto.uuid);
    return ApiResponse.responseWithNoContent(
      '이메일 인증이 성공적으로 처리되어 관리자 계정이 생성되었습니다.',
    );
  }

  @ApiGetChildrenAdmin()
  @UseGuards(AdminAuthGuard)
  @Get('/children')
  @HttpCode(HttpStatus.OK)
  async getChildrenAdmin(@CurrentAdmin() email: string) {
    const children = await this.adminService.getChildAdmins(email);
    return ApiResponse.responseWithData(
      '내가 생성한 관리자 계정 목록입니다.',
      children,
    );
  }

  @ApiDeleteChildAdmin()
  @UseGuards(AdminAuthGuard)
  @Delete('/children/:id')
  @HttpCode(HttpStatus.OK)
  async deleteChildAdmin(
    @CurrentAdmin() email: string,
    @Param() paramDto: DeleteChildAdminParamRequestDto,
  ) {
    await this.adminService.deleteChildAdmin(email, paramDto.id);
    return ApiResponse.responseWithNoContent(
      '관리자 계정이 성공적으로 삭제되었습니다.',
    );
  }

  @ApiRequestDeleteAdmin()
  @UseGuards(AdminAuthGuard)
  @Post('/me/deletion-requests')
  @HttpCode(HttpStatus.OK)
  async requestDeleteAdmin(@CurrentAdmin() email: string) {
    await this.adminService.requestDeleteAccount(email);
    return ApiResponse.responseWithNoContent(
      '회원탈퇴 신청이 성공적으로 처리되었습니다. 이메일을 확인해주세요.',
    );
  }

  @ApiConfirmDeleteAdmin()
  @Delete('/deletion-requests/:token')
  @HttpCode(HttpStatus.OK)
  async confirmDeleteAdmin(
    @Param() paramDto: ConfirmDeleteAdminParamRequestDto,
  ) {
    await this.adminService.confirmDeleteAccount(paramDto.token);
    return ApiResponse.responseWithNoContent('회원탈퇴가 완료되었습니다.');
  }

  @ApiForgotPasswordAdmin()
  @Post('/password-resets')
  @HttpCode(HttpStatus.OK)
  async forgotPasswordAdmin(
    @Body() forgotPasswordAdminBodyDto: ForgotPasswordAdminRequestDto,
  ) {
    await this.adminService.forgotPassword(forgotPasswordAdminBodyDto.email);
    return ApiResponse.responseWithNoContent(
      '비밀번호 재설정 링크를 이메일로 발송했습니다.',
    );
  }

  @ApiResetPasswordAdmin()
  @Patch('/password-resets/:uuid')
  @HttpCode(HttpStatus.OK)
  async resetPasswordAdmin(
    @Param() paramDto: ResetPasswordAdminParamRequestDto,
    @Body() resetPasswordAdminBodyDto: ResetPasswordAdminRequestDto,
  ) {
    await this.adminService.resetPassword(
      paramDto.uuid,
      resetPasswordAdminBodyDto.password,
    );
    return ApiResponse.responseWithNoContent(
      '비밀번호가 성공적으로 수정되었습니다.',
    );
  }

  @ApiGetCurrentAdmin()
  @Get('/me')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AdminAuthGuard)
  async getCurrentAdmin(@CurrentAdmin() email: string) {
    const profile = await this.adminService.getAdminProfile(email);
    return ApiResponse.responseWithData(
      '현재 로그인한 관리자 프로필입니다.',
      profile,
    );
  }

  @ApiUpdateAdminProfile()
  @Patch('/me')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AdminAuthGuard)
  async updateAdminProfile(
    @CurrentAdmin() email: string,
    @Body() updateAdminProfileBodyDto: UpdateAdminProfileRequestDto,
  ) {
    await this.adminService.updateAdminProfile(email, updateAdminProfileBodyDto);
    return ApiResponse.responseWithNoContent(
      '관리자 정보가 성공적으로 수정되었습니다.',
    );
  }
}
