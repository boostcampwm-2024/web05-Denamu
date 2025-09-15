import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ActivityService } from '../service/activity.service';
import { ApiResponse } from '../../common/response/common.response';
import {
  ReadActivityParamRequestDto,
  ReadActivityQueryRequestDto,
} from '../dto/request/readActivity.dto';
import { ApiReadActivities } from '../api-docs/readActivities.api-docs';

@ApiTags('Activity')
@Controller('activity')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

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
