import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AdminAuthGuard } from '@common/guard/session.guard';
import { ApiResponse } from '@common/response/common.response';

import { ApiAcceptRss } from '@rss/api-docs/acceptRss.api-docs';
import { ApiReadAllRss } from '@rss/api-docs/readAllRss.api-docs';
import { ApiReadRssAcceptHistory } from '@rss/api-docs/readRssAcceptHistory.api-docs';
import { ApiReadRssRejectHistory } from '@rss/api-docs/readRssRejectHistory.api-docs';
import { ApiRejectRss } from '@rss/api-docs/rejectRss.api-docs';
import { ManageRssRequestDto } from '@rss/dto/request/manageRss.dto';
import { RejectRssRequestDto } from '@rss/dto/request/rejectRss';
import { RssService } from '@rss/service/rss.service';

@ApiTags('Admin')
@Controller('admins/rss')
@UseGuards(AdminAuthGuard)
export class AdminRssController {
  constructor(private readonly rssService: RssService) {}

  @ApiReadAllRss()
  @Get()
  @HttpCode(HttpStatus.OK)
  async readAllRss() {
    return ApiResponse.responseWithData(
      'Rss 조회 완료',
      await this.rssService.readAllRss(),
    );
  }

  @ApiAcceptRss()
  @Post(':id/acceptances')
  @HttpCode(HttpStatus.CREATED)
  async acceptRss(@Param() rssAcceptParamDto: ManageRssRequestDto) {
    await this.rssService.acceptRss(rssAcceptParamDto);
    return ApiResponse.responseWithNoContent('승인이 완료되었습니다.');
  }

  @ApiRejectRss()
  @Post(':id/rejections')
  @HttpCode(HttpStatus.CREATED)
  async rejectRss(
    @Body() rssRejectBodyDto: RejectRssRequestDto,
    @Param() rssRejectParamDto: ManageRssRequestDto,
  ) {
    await this.rssService.rejectRss(rssRejectParamDto, rssRejectBodyDto);
    return ApiResponse.responseWithNoContent('거절이 완료되었습니다.');
  }

  @ApiReadRssAcceptHistory()
  @Get('acceptances')
  @HttpCode(HttpStatus.OK)
  async readAcceptHistory() {
    return ApiResponse.responseWithData(
      '승인 기록 조회가 완료되었습니다.',
      await this.rssService.readAcceptHistory(),
    );
  }

  @ApiReadRssRejectHistory()
  @Get('rejections')
  @HttpCode(HttpStatus.OK)
  async readRejectHistory() {
    return ApiResponse.responseWithData(
      'RSS 거절 기록을 조회하였습니다.',
      await this.rssService.readRejectHistory(),
    );
  }
}
