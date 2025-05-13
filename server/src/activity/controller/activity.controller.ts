import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';

@Controller('activity')
export class ActivityController {
  constructor() {}

  // 활동 조회 API
  @Get(':userId')
  async readActivities(@Param userId: number, @Query year: number){
    return ApiResponse.responseWithData(
      '요청이 성공적으로 처리되었습니다.',
      await this activityService.readActivities(userId, year);
    )
  }



}