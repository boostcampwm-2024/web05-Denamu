import { Controller, Get, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { StatisticService } from '@statistic/service/statistic.service';
import { ApiResponse } from '@common/response/common.response';
import { ApiTags } from '@nestjs/swagger';
import { ReadStatisticRequestDto } from '@statistic/dto/request/readStatistic.dto';
import { ApiReadPlatformStatistic } from '@statistic/api-docs/readPlatformStatistic.api-docs';
import { ApiReadStatistic } from '@statistic/api-docs/readStatistic.api-docs';

@ApiTags('Statistic')
@Controller('statistic')
export class StatisticController {
  constructor(private readonly statisticService: StatisticService) {}

  @ApiReadStatistic('today')
  @Get('today')
  @HttpCode(HttpStatus.OK)
  async readTodayStatistic(
    @Query() statisticQueryDto: ReadStatisticRequestDto,
  ) {
    return ApiResponse.responseWithData(
      '금일 조회수 통계 조회 완료',
      await this.statisticService.readTodayStatistic(statisticQueryDto),
    );
  }

  @ApiReadStatistic('all')
  @Get('all')
  @HttpCode(HttpStatus.OK)
  async readAllStatistic(@Query() statisticQueryDto: ReadStatisticRequestDto) {
    return ApiResponse.responseWithData(
      '전체 조회수 통계 조회 완료',
      await this.statisticService.readAllStatistic(statisticQueryDto),
    );
  }

  @ApiReadPlatformStatistic()
  @Get('platform')
  @HttpCode(HttpStatus.OK)
  async readPlatformStatistic() {
    return ApiResponse.responseWithData(
      '블로그 플랫폼 통계 조회 완료',
      await this.statisticService.readPlatformStatistic(),
    );
  }
}
