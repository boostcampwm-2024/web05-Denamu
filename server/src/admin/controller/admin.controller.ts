import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { Request, Response } from 'express';

import { ApiCertificateAdmin } from '@admin/api-docs/certificateAdmin.api-docs';
import { ApiCheckNameDuplication } from '@admin/api-docs/checkNameDuplication.api-docs';
import { ApiDeleteChildAdmin } from '@admin/api-docs/deleteChildAdmin.api-docs';
import { ApiGetChildrenAdmin } from '@admin/api-docs/getChildrenAdmin.api-docs';
import { ApiGetCurrentAdmin } from '@admin/api-docs/getCurrentAdmin.api-docs';
import { ApiLoginAdmin } from '@admin/api-docs/loginAdmin.api-docs';
import { ApiLogoutAdmin } from '@admin/api-docs/logoutAdmin.api-docs';
import { ApiRegisterAdmin } from '@admin/api-docs/registerAdmin.api-docs';
import { CertificateAdminRequestDto } from '@admin/dto/request/certificateAdmin.dto';
import { CheckNameDuplicationRequestDto } from '@admin/dto/request/checkNameDuplication.dto';
import { LoginAdminRequestDto } from '@admin/dto/request/loginAdmin.dto';
import { RegisterAdminRequestDto } from '@admin/dto/request/registerAdmin.dto';
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

  @ApiCheckNameDuplication()
  @UseGuards(AdminAuthGuard)
  @Get('/name-availability')
  @HttpCode(HttpStatus.OK)
  async checkNameDuplication(
    @Query() checkNameDuplicationRequestDto: CheckNameDuplicationRequestDto,
  ) {
    return ApiResponse.responseWithData(
      '이름 중복 조회 요청이 성공적으로 처리되었습니다.',
      await this.adminService.checkNameDuplication(
        checkNameDuplicationRequestDto.name,
      ),
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
    @Param('id', ParseIntPipe) targetAdminId: number,
  ) {
    await this.adminService.deleteChildAdmin(email, targetAdminId);
    return ApiResponse.responseWithNoContent(
      '관리자 계정이 성공적으로 삭제되었습니다.',
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
}
