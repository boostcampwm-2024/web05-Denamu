import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { Request, Response } from 'express';

import { ApiCreateAdmin } from '@admin/api-docs/createAdmin.api-docs';
import { ApiGetChildrenAdmin } from '@admin/api-docs/getChildrenAdmin.api-docs';
import { ApiGetCurrentAdmin } from '@admin/api-docs/getCurrentAdmin.api-docs';
import { ApiLoginAdmin } from '@admin/api-docs/loginAdmin.api-docs';
import { ApiLogoutAdmin } from '@admin/api-docs/logoutAdmin.api-docs';
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

  @ApiCreateAdmin()
  @UseGuards(AdminAuthGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createAdmin(
    @Body() registerAdminBodyDto: RegisterAdminRequestDto,
    @CurrentAdmin() loginId: string,
  ) {
    await this.adminService.createAdmin(registerAdminBodyDto, loginId);
    return ApiResponse.responseWithNoContent(
      '성공적으로 관리자 계정이 생성되었습니다.',
    );
  }

  @ApiGetChildrenAdmin()
  @UseGuards(AdminAuthGuard)
  @Get('/children')
  @HttpCode(HttpStatus.OK)
  async getChildrenAdmin(@CurrentAdmin() loginId: string) {
    const children = await this.adminService.getChildAdmins(loginId);
    return ApiResponse.responseWithData(
      '내가 생성한 관리자 계정 목록입니다.',
      children,
    );
  }

  @ApiGetCurrentAdmin()
  @Get('/me')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AdminAuthGuard)
  async getCurrentAdmin(@CurrentAdmin() loginId: string) {
    const profile = await this.adminService.getAdminProfile(loginId);
    return ApiResponse.responseWithData(
      '현재 로그인한 관리자 프로필입니다.',
      profile,
    );
  }
}
