import { Controller, Get, Param, Query } from '@nestjs/common';

import { ActivityService } from '../service/activity.service';
import { ApiResponse } from '../../common/response/common.response';
import { ActivityParamRequestDto } from '../dto/request/activity-param.dto';
import { ActivityQueryRequestDto } from '../dto/request/activity-query.dto';

@Controller('activity')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Get(':userId')
  async readActivities(
    @Param() paramDto: ActivityParamRequestDto,
    @Query() queryDto: ActivityQueryRequestDto,
  ) {
    return ApiResponse.responseWithData(
      '요청이 성공적으로 처리되었습니다.',
      await this.activityService.readActivities(paramDto.userId, queryDto.year),
    );
  }
}
