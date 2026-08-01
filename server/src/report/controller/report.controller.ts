import { Body, Controller, HttpCode, HttpStatus, Param, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '@common/decorator';
import { JwtGuard, Payload } from '@common/guard/jwt.guard';
import { ApiResponse } from '@common/response/common.response';

import { ManageBlockRequestDto } from '@block/dto/request/manageBlock.dto';
import { ManageRssBlockRequestDto } from '@block/dto/request/manageRssBlock.dto';

import { CommentParamRequestDto } from '@comment/dto/request/commentParam.dto';

import { ManageFeedRequestDto } from '@feed/dto/request/manageFeed.dto';

import {
  ApiCreateCommentReport,
  ApiCreateFeedReport,
  ApiCreateRssReport,
  ApiCreateUserReport,
} from '@report/api-docs/createReport.api-docs';
import { CreateReportRequestDto } from '@report/dto/request/createReport.dto';
import { ReportService } from '@report/service/report.service';

@ApiTags('Report')
@Controller('reports')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @ApiCreateUserReport()
  @Post('/users/:userId')
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.CREATED)
  async createUserReport(
    @CurrentUser() user: Payload,
    @Param() paramDto: ManageBlockRequestDto,
    @Body() reportDto: CreateReportRequestDto,
  ) {
    await this.reportService.reportUser(user, paramDto.userId, reportDto);
    return ApiResponse.responseWithNoContent('사용자 신고를 성공했습니다.');
  }

  @ApiCreateRssReport()
  @Post('/rss/:rssId')
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.CREATED)
  async createRssReport(
    @CurrentUser() user: Payload,
    @Param() paramDto: ManageRssBlockRequestDto,
    @Body() reportDto: CreateReportRequestDto,
  ) {
    await this.reportService.reportRss(user, paramDto.rssId, reportDto);
    return ApiResponse.responseWithNoContent('RSS 신고를 성공했습니다.');
  }

  @ApiCreateCommentReport()
  @Post('/comments/:commentId')
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.CREATED)
  async createCommentReport(
    @CurrentUser() user: Payload,
    @Param() paramDto: CommentParamRequestDto,
    @Body() reportDto: CreateReportRequestDto,
  ) {
    await this.reportService.reportComment(user, paramDto.commentId, reportDto);
    return ApiResponse.responseWithNoContent('댓글 신고를 성공했습니다.');
  }

  @ApiCreateFeedReport()
  @Post('/feeds/:feedId')
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.CREATED)
  async createFeedReport(
    @CurrentUser() user: Payload,
    @Param() paramDto: ManageFeedRequestDto,
    @Body() reportDto: CreateReportRequestDto,
  ) {
    await this.reportService.reportFeed(user, paramDto.feedId, reportDto);
    return ApiResponse.responseWithNoContent('게시글 신고를 성공했습니다.');
  }
}
