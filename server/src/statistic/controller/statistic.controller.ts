import { Controller, Get, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { StatisticService } from '../service/statistic.service';
import { ApiResponse } from '../../common/response/common.response';
import { ApiTags } from '@nestjs/swagger';
import { GetStatisticRequestDto } from '../dto/request/getStatistic.dto';
import { ApiReadPlatformStatistic } from '../api-docs/readPlatformStatistic.api-docs';
import { ApiReadStatistic } from '../api-docs/statistic.api-docs';

@ApiTags('Statistic')
@Controller('statistic')
export class StatisticController {
  constructor(private readonly statisticService: StatisticService) {}

  @ApiReadStatistic('today')
  @Get('today')
  @HttpCode(HttpStatus.OK)
  async readTodayStatistic(@Query() statisticQueryDto: GetStatisticRequestDto) {
    return ApiResponse.responseWithData(
      '금일 조회수 통계 조회 완료',
      await this.statisticService.readTodayStatistic(statisticQueryDto),
    );
  }

  @ApiReadStatistic('all')
  @Get('all')
  @HttpCode(HttpStatus.OK)
  async readAllStatistic(@Query() statisticQueryDto: GetStatisticRequestDto) {
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
