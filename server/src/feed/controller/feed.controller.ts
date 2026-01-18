import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
  Res,
  Sse,
  UseInterceptors,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ApiTags } from '@nestjs/swagger';

import { Request, Response } from 'express';
import { Observable } from 'rxjs';

import { ApiResponse } from '@common/response/common.response';

import { ApiDeleteCheckFeed } from '@feed/api-docs/deleteCheckFeed.api-docs';
import { ApiGetFeedDetail } from '@feed/api-docs/getFeedDetail.api-docs';
import { ApiReadFeedPagination } from '@feed/api-docs/readFeedPagination.api-docs';
import { ApiReadRecentFeedList } from '@feed/api-docs/readRecentFeedList.api-docs';
import { ApiReadTrendFeedList } from '@feed/api-docs/readTrendFeedList.api-docs';
import { ApiSearchFeedList } from '@feed/api-docs/searchFeedList.api-docs';
import { ApiUpdateFeedViewCount } from '@feed/api-docs/updateFeedViewCount.api-docs';
import { ManageFeedRequestDto } from '@feed/dto/request/manageFeed.dto';
import { ReadFeedPaginationRequestDto } from '@feed/dto/request/readFeedPagination.dto';
import { SearchFeedRequestDto } from '@feed/dto/request/searchFeed.dto';
import { FeedTrendResponseDto } from '@feed/dto/response/readFeedPagination.dto';
import { ReadFeedInterceptor } from '@feed/interceptor/read-feed.interceptor';
import { FeedService } from '@feed/service/feed.service';

@ApiTags('Feed')
@Controller('feed')
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

  @ApiReadRecentFeedList()
  @Get('/recent')
  @HttpCode(HttpStatus.OK)
  async readRecentFeedList() {
    return ApiResponse.responseWithData(
      '최신 피드 업데이트 완료',
      await this.feedService.readRecentFeedList(),
    );
  }

  @ApiGetFeedDetail()
  @Get('/detail/:feedId')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(ReadFeedInterceptor)
  async getFeedDetail(@Param() feedDetailRequestDto: ManageFeedRequestDto) {
    return ApiResponse.responseWithData(
      '요청이 성공적으로 처리되었습니다.',
      await this.feedService.getFeedDetail(feedDetailRequestDto),
    );
  }

  @ApiDeleteCheckFeed()
  @Delete('/:feedId')
  @HttpCode(HttpStatus.OK)
  async deleteCheckFeed(@Param() feedDeleteCheckDto: ManageFeedRequestDto) {
    await this.feedService.deleteCheckFeed(feedDeleteCheckDto);
    return ApiResponse.responseWithNoContent(
      '게시글 삭제 확인 요청을 성공했습니다.',
    );
  }
}
