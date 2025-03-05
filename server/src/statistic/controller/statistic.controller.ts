import { Controller, Get, Query } from '@nestjs/common';
import { StatisticService } from '../service/statistic.service';
import { ApiResponse } from '../../common/response/common.response';
import { ApiTags } from '@nestjs/swagger';
import { StatisticRequestDto } from '../dto/request/statistic-query.dto';
import { ApiReadPlatformStatistic } from '../api-docs/readPlatformStatistic.api-docs';
import { ApiStatistic } from '../api-docs/statistic.api-docs';

@ApiTags('Statistic')
@Controller('statistic')
export class StatisticController {
  constructor(private readonly statisticService: StatisticService) {}

  @ApiStatistic('today')
  @Get('today')
  async readTodayStatistic(@Query() statisticQueryDto: StatisticRequestDto) {
    return ApiResponse.responseWithData(
      '금일 조회수 통계 조회 완료',
      await this.statisticService.readTodayStatistic(statisticQueryDto),
    );
  }

  @ApiStatistic('all')
  @Get('all')
  async readAllStatistic(@Query() statisticQueryDto: StatisticRequestDto) {
    return ApiResponse.responseWithData(
      '전체 조회수 통계 조회 완료',
      await this.statisticService.readAllStatistic(statisticQueryDto),
    );
  }

  @ApiReadPlatformStatistic()
  @Get('platform')
  async readPlatformStatistic() {
    return ApiResponse.responseWithData(
      '블로그 플랫폼 통계 조회 완료',
      await this.statisticService.readPlatformStatistic(),
    );
  }
}
