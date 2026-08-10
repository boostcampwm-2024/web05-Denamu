import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AdminAuthGuard } from '@common/guard/session.guard';
import { ApiResponse } from '@common/response/common.response';

import { ApiGetSuspendedUsers } from '@suspension/api-docs/getSuspendedUsers.api-docs';
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
}
