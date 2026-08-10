import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CurrentAdmin } from '@common/decorator/current-admin.decorator';
import { AdminAuthGuard } from '@common/guard/session.guard';
import { ApiResponse } from '@common/response/common.response';

import { ApiCreateUserSuspension } from '@suspension/api-docs/createUserSuspension.api-docs';
import { ApiGetSuspendedUsers } from '@suspension/api-docs/getSuspendedUsers.api-docs';
import { CreateUserSuspensionRequestDto } from '@suspension/dto/request/createUserSuspension.dto';
import { GetSuspendedUsersRequestDto } from '@suspension/dto/request/getSuspendedUsers.dto';
import { SuspensionService } from '@suspension/service/suspension.service';

@ApiTags('Admin')
@Controller('admins/user-suspensions')
@UseGuards(AdminAuthGuard)
export class AdminSuspensionController {
  constructor(private readonly suspensionService: SuspensionService) {}

  @ApiGetSuspendedUsers()
  @Get()
  @HttpCode(HttpStatus.OK)
  async getSuspendedUsers(@Query() queryDto: GetSuspendedUsersRequestDto) {
    return ApiResponse.responseWithData(
      '정지된 유저 목록 조회를 성공했습니다.',
      await this.suspensionService.getSuspendedUsers(queryDto),
    );
  }

  @ApiCreateUserSuspension()
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createUserSuspension(
    @Body() createDto: CreateUserSuspensionRequestDto,
    @CurrentAdmin() email: string,
  ) {
    await this.suspensionService.createUserSuspension(email, createDto);
    return ApiResponse.responseWithNoContent(
      '유저 정지 처리가 완료되었습니다.',
    );
  }
}
