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
import { ApiGetSessionIdAdmin } from '@admin/api-docs/getSessionIdAdmin.api-docs';
import { ApiLoginAdmin } from '@admin/api-docs/loginAdmin.api-docs';
import { ApiLogoutAdmin } from '@admin/api-docs/logoutAdmin.api-docs';
import { LoginAdminRequestDto } from '@admin/dto/request/loginAdmin.dto';
import { RegisterAdminRequestDto } from '@admin/dto/request/registerAdmin.dto';
import { AdminService } from '@admin/service/admin.service';

import { AdminAuthGuard } from '@common/guard/auth.guard';
import { ApiResponse } from '@common/response/common.response';

@ApiTags('Admin')
@Controller('admin')
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
  @Post('/register')
  @HttpCode(HttpStatus.CREATED)
  async createAdmin(@Body() registerAdminBodyDto: RegisterAdminRequestDto) {
    await this.adminService.createAdmin(registerAdminBodyDto);
    return ApiResponse.responseWithNoContent(
      '성공적으로 관리자 계정이 생성되었습니다.',
    );
  }

  @ApiGetSessionIdAdmin()
  @Get('/sessionId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AdminAuthGuard)
  getSessionIdAdmin() {
    return ApiResponse.responseWithNoContent('정상적인 sessionId 입니다.');
  }
}
