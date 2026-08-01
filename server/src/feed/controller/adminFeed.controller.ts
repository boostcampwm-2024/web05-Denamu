import { Controller, Get, HttpCode, HttpStatus, Param, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AdminAuthGuard } from '@common/guard/session.guard';
import { ApiResponse } from '@common/response/common.response';

import { ApiReadNoSummaryFeedList } from '@feed/api-docs/readNoSummaryFeedList.api-docs';
import { ApiRequestAiSummary } from '@feed/api-docs/requestAiSummary.api-docs';
import { ManageFeedRequestDto } from '@feed/dto/request/manageFeed.dto';
import { FeedService } from '@feed/service/feed.service';

@ApiTags('Admin')
@Controller('admins/feeds')
@UseGuards(AdminAuthGuard)
export class AdminFeedController {
  constructor(private readonly feedService: FeedService) {}

  @ApiReadNoSummaryFeedList()
  @Get('no-summary')
  @HttpCode(HttpStatus.OK)
  async readFeedsWithoutSummary() {
    return ApiResponse.responseWithData(
      'AI 요약 없는 게시글 목록 조회 완료',
      await this.feedService.readFeedsWithoutSummary(),
    );
  }

  @ApiRequestAiSummary()
  @Post(':feedId/ai-summary-requests')
  @HttpCode(HttpStatus.ACCEPTED)
  async requestAiSummary(@Param() aiSummaryParamDto: ManageFeedRequestDto) {
    await this.feedService.requestAiSummary(aiSummaryParamDto.feedId);
    return ApiResponse.responseWithNoContent(
      'AI 요약 재요청이 접수되었습니다.',
    );
  }
}
