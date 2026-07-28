import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { ApiGetNotice } from '@notice/api-docs/getNotice.api-docs';
import { ApiGetNotices } from '@notice/api-docs/getNotices.api-docs';
import { GetNoticeRequestDto } from '@notice/dto/request/getNotice.dto';
import { GetNoticesRequestDto } from '@notice/dto/request/getNotices.dto';
import { NoticeService } from '@notice/service/notice.service';

import { ApiResponse } from '@common/response/common.response';

@ApiTags('Notice')
@Controller('notices')
export class NoticeController {
  constructor(private readonly noticeService: NoticeService) {}

  @ApiGetNotices()
  @Get()
  @HttpCode(HttpStatus.OK)
  async getNotices(@Query() queryDto: GetNoticesRequestDto) {
    return ApiResponse.responseWithData(
      '공지사항 목록 조회를 성공했습니다.',
      await this.noticeService.getPublicNotices(queryDto),
    );
  }

  @ApiGetNotice()
  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  async getNotice(@Param() paramDto: GetNoticeRequestDto) {
    return ApiResponse.responseWithData(
      '공지사항 상세 조회를 성공했습니다.',
      await this.noticeService.getPublicNotice(paramDto.id),
    );
  }
}
