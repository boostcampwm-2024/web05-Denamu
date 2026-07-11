import {
  Controller,
  Get,
  Head,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
  Res,
  Sse,
  UseGuards,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ApiTags } from '@nestjs/swagger';

import { Request, Response } from 'express';
import { Observable } from 'rxjs';

import { CurrentUser } from '@common/decorator/current-user.decorator';
import { AdminAuthGuard } from '@common/guard/session.guard';
import { JwtGuard, OptionalJwtGuard, Payload } from '@common/guard/jwt.guard';
import { ApiResponse } from '@common/response/common.response';

import { ApiDeleteCheckFeed } from '@feed/api-docs/deleteCheckFeed.api-docs';
import { ApiGetFeedDetail } from '@feed/api-docs/getFeedDetail.api-docs';
import { ApiReadFeedPagination } from '@feed/api-docs/readFeedPagination.api-docs';
import { ApiReadNoSummaryFeedList } from '@feed/api-docs/readNoSummaryFeedList.api-docs';
import { ApiReadRecentFeedList } from '@feed/api-docs/readRecentFeedList.api-docs';
import { ApiReadSubscriptionFeed } from '@feed/api-docs/readSubscriptionFeed.api-docs';
import { ApiReadTrendFeedList } from '@feed/api-docs/readTrendFeedList.api-docs';
import { ApiRequestAiSummary } from '@feed/api-docs/requestAiSummary.api-docs';
import { ApiSearchFeedList } from '@feed/api-docs/searchFeedList.api-docs';
import { ApiUpdateFeedViewCount } from '@feed/api-docs/updateFeedViewCount.api-docs';
import { ManageFeedRequestDto } from '@feed/dto/request/manageFeed.dto';
import { ReadFeedPaginationRequestDto } from '@feed/dto/request/readFeedPagination.dto';
import { SearchFeedRequestDto } from '@feed/dto/request/searchFeed.dto';
import { FeedTrendResponseDto } from '@feed/dto/response/readFeedPagination.dto';
import { FeedViewedEvent } from '@feed/event/feed-viewed.event';
import { FeedService } from '@feed/service/feed.service';

@ApiTags('Feed')
@Controller('feeds')
export class FeedController {
  constructor(
    private readonly feedService: FeedService,
    private readonly eventService: EventEmitter2,
  ) {}

  @ApiReadFeedPagination()
  @Get()
  @HttpCode(HttpStatus.OK)
  async readFeedPagination(
    @Query() feedPaginationQueryDto: ReadFeedPaginationRequestDto,
  ) {
    return ApiResponse.responseWithData(
      '피드 조회 완료',
      await this.feedService.readFeedPagination(feedPaginationQueryDto),
    );
  }

  @ApiReadTrendFeedList()
  @Sse('trend/sse')
  readTrendFeedList() {
    return new Observable((observer) => {
      this.feedService
        .readTrendFeedList()
        .then((trendData: FeedTrendResponseDto[]) => {
          observer.next({
            data: {
              message: '현재 트렌드 피드 수신 완료',
              data: trendData,
            },
          });
        })
        .catch((err) => {
          observer.error(err);
        });
      this.eventService.on(
        'ranking-update',
        (trendData: FeedTrendResponseDto[]) => {
          observer.next({
            data: {
              message: '새로운 트렌드 피드 수신 완료',
              data: trendData,
            },
          });
        },
      );
    });
  }

  @ApiSearchFeedList()
  @Get('search')
  @HttpCode(HttpStatus.OK)
  async searchFeedList(@Query() searchFeedQueryDto: SearchFeedRequestDto) {
    return ApiResponse.responseWithData(
      '검색 결과 조회 완료',
      await this.feedService.searchFeedList(searchFeedQueryDto),
    );
  }

  @ApiUpdateFeedViewCount()
  @Post('/:feedId')
  @HttpCode(HttpStatus.OK)
  async updateFeedViewCount(
    @Param() viewUpdateParamDto: ManageFeedRequestDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.feedService.updateFeedViewCount(
      viewUpdateParamDto,
      request,
      response,
    );
    return ApiResponse.responseWithNoContent(
      '요청이 성공적으로 처리되었습니다.',
    );
  }

  @ApiReadNoSummaryFeedList()
  @UseGuards(AdminAuthGuard)
  @Get('/no-summary')
  @HttpCode(HttpStatus.OK)
  async readFeedsWithoutSummary() {
    return ApiResponse.responseWithData(
      'AI 요약 없는 게시글 목록 조회 완료',
      await this.feedService.readFeedsWithoutSummary(),
    );
  }

  @ApiRequestAiSummary()
  @UseGuards(AdminAuthGuard)
  @Post('/:feedId/ai-summary-requests')
  @HttpCode(HttpStatus.ACCEPTED)
  async requestAiSummary(@Param() aiSummaryParamDto: ManageFeedRequestDto) {
    await this.feedService.requestAiSummary(aiSummaryParamDto.feedId);
    return ApiResponse.responseWithNoContent(
      'AI 요약 재요청이 접수되었습니다.',
    );
  }

  @ApiReadRecentFeedList()
  @Get('/recent')
  @HttpCode(HttpStatus.OK)
  async readRecentFeedList() {
    return ApiResponse.responseWithData(
      '최신 피드 업데이트 완료',
      await this.feedService.readRecentFeedList(),
    );
  }

  @ApiReadSubscriptionFeed()
  @Get('/subscriptions')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtGuard)
  async readSubscriptionFeeds(
    @CurrentUser() user: Payload,
    @Query() feedPaginationQueryDto: ReadFeedPaginationRequestDto,
  ) {
    return ApiResponse.responseWithData(
      '구독 피드 조회 완료',
      await this.feedService.readSubscriptionFeeds(
        user.id,
        feedPaginationQueryDto,
      ),
    );
  }

  @ApiDeleteCheckFeed()
  @Head(':feedId')
  @HttpCode(HttpStatus.OK)
  async deleteCheckFeed(@Param() feedDeleteCheckDto: ManageFeedRequestDto) {
    await this.feedService.deleteCheckFeed(feedDeleteCheckDto);
    return ApiResponse.responseWithNoContent(
      '게시글 삭제 확인 요청을 성공했습니다.',
    );
  }

  @ApiGetFeedDetail()
  @Get(':feedId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(OptionalJwtGuard)
  async getFeedDetail(
    @Param() feedDetailRequestDto: ManageFeedRequestDto,
    @CurrentUser() user: Payload | null,
  ) {
    if (user) {
      this.eventService.emit(
        'feed.viewed',
        new FeedViewedEvent(feedDetailRequestDto.feedId, user.id),
      );
    }
    return ApiResponse.responseWithData(
      '요청이 성공적으로 처리되었습니다.',
      await this.feedService.getFeedDetail(feedDetailRequestDto, user?.id),
    );
  }
}
