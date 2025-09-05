import { ApiTags } from '@nestjs/swagger';
import { ApiResponse } from '../../common/response/common.response';
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
import { FeedService } from '../service/feed.service';
import { ReadFeedPaginationRequestDto } from '../dto/request/readFeedPagination.dto';
import { SearchFeedRequestDto } from '../dto/request/searchFeed.dto';
import { Response, Request } from 'express';
import { Observable } from 'rxjs';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ApiReadFeedPagination } from '../api-docs/readFeedPagination.api-docs';
import { ApiReadTrendFeedList } from '../api-docs/readTrendFeedList.api-docs';
import { ApiSearchFeedList } from '../api-docs/searchFeedList.api-docs';
import { ApiUpdateFeedViewCount } from '../api-docs/updateFeedViewCount.api-docs';
import { ApiReadRecentFeedList } from '../api-docs/readRecentFeedList.api-docs';
import { FeedTrendResponseDto } from '../dto/response/readFeedPagination.dto';
import { UpdateFeedViewCountRequestDto } from '../dto/request/updateFeedViewCount.dto';
import { GetFeedDetailRequestDto } from '../dto/request/getFeedDetail.dto';
import { ApiGetFeedDetail } from '../api-docs/getFeedDetail.api-docs';
import { ReadFeedInterceptor } from '../interceptor/read-feed.interceptor';
import { DeleteCheckFeedRequestDto } from '../dto/request/deleteCheckFeed.dto';
import { ApiDeleteCheckFeed } from '../api-docs/deleteCheckFeed.api-docs';

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
    @Param() viewUpdateParamDto: UpdateFeedViewCountRequestDto,
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
  async getFeedDetail(@Param() feedDetailRequestDto: GetFeedDetailRequestDto) {
    return ApiResponse.responseWithData(
      '요청이 성공적으로 처리되었습니다.',
      await this.feedService.getFeedDetail(feedDetailRequestDto),
    );
  }

  @ApiDeleteCheckFeed()
  @Delete('/:feedId')
  @HttpCode(HttpStatus.OK)
  async deleteCheckFeed(
    @Param() feedDeleteCheckDto: DeleteCheckFeedRequestDto,
  ) {
    await this.feedService.deleteCheckFeed(feedDeleteCheckDto);
    return ApiResponse.responseWithNoContent(
      '게시글 삭제 확인 요청을 성공했습니다.',
    );
  }
}
