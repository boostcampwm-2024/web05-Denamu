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
import { Request, Response } from 'express';
import { AdminService } from '../service/admin.service';
import { RegisterAdminRequestDto } from '../dto/request/register-admin.dto';
import { ApiTags } from '@nestjs/swagger';
import { ApiResponse } from '../../common/response/common.response';
import { LoginAdminRequestDto } from '../dto/request/login-admin.dto';
import { CookieAuthGuard } from '../../common/guard/auth.guard';
import { ApiLoginAdmin } from '../api-docs/loginAdmin.api-docs';
import { ApiReadSessionIdAdmin } from '../api-docs/readSessionIdAdmin.api-docs';
import { ApiLogoutAdmin } from '../api-docs/logoutAdmin.api-docs';
import { ApiCreateAdmin } from '../api-docs/createAdmin.api-docs';

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
  @UseGuards(CookieAuthGuard)
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
  @UseGuards(CookieAuthGuard)
  @Post('/register')
  async createAdmin(@Body() registerAdminBodyDto: RegisterAdminRequestDto) {
    await this.adminService.createAdmin(registerAdminBodyDto);
    return ApiResponse.responseWithNoContent(
      '성공적으로 관리자 계정이 생성되었습니다.',
    );
  }

  @ApiReadSessionIdAdmin()
  @Get('/sessionId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(CookieAuthGuard)
  async readSessionIdAdmin() {
    return ApiResponse.responseWithNoContent('정상적인 sessionId 입니다.');
  }
}
