import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { ApiCreateNotice } from '@notice/api-docs/createNotice.api-docs';
import { ApiDeleteNotice } from '@notice/api-docs/deleteNotice.api-docs';
import { ApiGetAdminNotice } from '@notice/api-docs/getAdminNotice.api-docs';
import { ApiGetAdminNotices } from '@notice/api-docs/getAdminNotices.api-docs';
import { ApiUpdateNotice } from '@notice/api-docs/updateNotice.api-docs';
import { CreateNoticeRequestDto } from '@notice/dto/request/createNotice.dto';
import { GetAdminNoticesRequestDto } from '@notice/dto/request/getAdminNotices.dto';
import { GetNoticeRequestDto } from '@notice/dto/request/getNotice.dto';
import { UpdateNoticeRequestDto } from '@notice/dto/request/updateNotice.dto';
import { NoticeService } from '@notice/service/notice.service';

import { CurrentAdmin } from '@common/decorator/current-admin.decorator';
import { AdminAuthGuard } from '@common/guard/session.guard';
import { ApiResponse } from '@common/response/common.response';

@ApiTags('Admin')
@Controller('admins/notices')
@UseGuards(AdminAuthGuard)
export class AdminNoticeController {
  constructor(private readonly noticeService: NoticeService) {}

  @ApiGetAdminNotices()
  @Get()
  @HttpCode(HttpStatus.OK)
  async getAdminNotices(@Query() queryDto: GetAdminNoticesRequestDto) {
    return ApiResponse.responseWithData(
      '공지사항 목록 조회를 성공했습니다.',
      await this.noticeService.getAdminNotices(queryDto),
    );
  }

  @ApiGetAdminNotice()
  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  async getAdminNotice(@Param('id', ParseIntPipe) id: number) {
    return ApiResponse.responseWithData(
      '공지사항 상세 조회를 성공했습니다.',
      await this.noticeService.getAdminNotice(id),
    );
  }

  @ApiCreateNotice()
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createNotice(
    @CurrentAdmin() email: string,
    @Body() bodyDto: CreateNoticeRequestDto,
  ) {
    return ApiResponse.responseWithData(
      '공지사항이 성공적으로 작성되었습니다.',
      await this.noticeService.createNotice(email, bodyDto),
    );
  }

  @ApiUpdateNotice()
  @Patch('/:id')
  @HttpCode(HttpStatus.OK)
  async updateNotice(
    @Param() paramDto: GetNoticeRequestDto,
    @Body() bodyDto: UpdateNoticeRequestDto,
  ) {
    return ApiResponse.responseWithData(
      '공지사항이 성공적으로 수정되었습니다.',
      await this.noticeService.updateNotice(paramDto.id, bodyDto),
    );
  }

  @ApiDeleteNotice()
  @Delete('/:id')
  @HttpCode(HttpStatus.OK)
  async deleteNotice(@Param('id', ParseIntPipe) id: number) {
    await this.noticeService.deleteNotice(id);
    return ApiResponse.responseWithNoContent(
      '공지사항이 성공적으로 삭제되었습니다.',
    );
  }
}
