import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { ApiReadActivities } from '@activity/api-docs/readActivities.api-docs';
import { ApiReadActivityYears } from '@activity/api-docs/readActivityYears.api-docs';
import {
  ReadActivityParamRequestDto,
  ReadActivityQueryRequestDto,
} from '@activity/dto/request/readActivity.dto';
import { ActivityService } from '@activity/service/activity.service';

import { ApiResponse } from '@common/response/common.response';

@ApiTags('Activity')
@Controller('activities')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @ApiReadActivityYears()
  @Get(':userId/years')
  @HttpCode(HttpStatus.OK)
  async readActivityYears(@Param() paramDto: ReadActivityParamRequestDto) {
    return ApiResponse.responseWithData(
      '요청이 성공적으로 처리되었습니다.',
      await this.activityService.readActivityYears(paramDto.userId),
    );
  }

  @ApiReadActivities()
  @Get(':userId')
  @HttpCode(HttpStatus.OK)
  async readActivities(
    @Param() paramDto: ReadActivityParamRequestDto,
    @Query() queryDto: ReadActivityQueryRequestDto,
  ) {
    return ApiResponse.responseWithData(
      '요청이 성공적으로 처리되었습니다.',
      await this.activityService.readActivities(paramDto.userId, queryDto.year),
    );
  }
}
