import { ApiTags } from '@nestjs/swagger';
import { ApiResponse } from '../../common/response/common.response';
import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
  Res,
  Sse,
} from '@nestjs/common';
import { FeedService } from '../service/feed.service';
import { FeedPaginationRequestDto } from '../dto/request/feed-pagination.dto';
import { SearchFeedRequestDto } from '../dto/request/search-feed.dto';
import { Response, Request } from 'express';
import { Observable } from 'rxjs';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ApiReadFeedPagination } from '../api-docs/readFeedPagination.api-docs';
import { ApiReadTrendFeedList } from '../api-docs/readTrendFeedList.api-docs';
import { ApiSearchFeedList } from '../api-docs/searchFeedList.api-docs';
import { ApiUpdateFeedViewCount } from '../api-docs/updateFeedViewCount.api-docs';
import { ApiReadRecentFeedList } from '../api-docs/readRecentFeedList.api-docs';
import { FeedTrendResponseDto } from '../dto/response/feed-pagination.dto';
import { FeedViewUpdateRequestDto } from '../dto/request/feed-update.dto';
import { FeedDetailRequestDto } from '../dto/request/feed-detail.dto';
import { ApiReadFeedDetail } from '../api-docs/readFeedDetail.api-docs';

@ApiTags('Feed')
@Controller('feed')
export class FeedController {
  constructor(
    private readonly feedService: FeedService,
    private readonly eventService: EventEmitter2,
  ) {}

  @ApiReadFeedPagination()
  @Get('')
  @HttpCode(HttpStatus.OK)
  async readFeedPagination(
    @Query() feedPaginationQueryDto: FeedPaginationRequestDto,
  ) {
    return ApiResponse.responseWithData(
      '피드 조회 완료',
      await this.feedService.readFeedPagination(feedPaginationQueryDto),
    );
  }

  @ApiReadTrendFeedList()
  @Sse('trend/sse')
  async readTrendFeedList() {
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
    @Param() viewUpdateParamDto: FeedViewUpdateRequestDto,
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

  @ApiReadFeedDetail()
  @Get('/detail/:feedId')
  @HttpCode(HttpStatus.OK)
  async readFeedDetail(@Param() feedDetailRequestDto: FeedDetailRequestDto) {
    return ApiResponse.responseWithData(
      '요청이 성공적으로 처리되었습니다.',
      await this.feedService.readFeedDetail(feedDetailRequestDto),
    );
  }
}
