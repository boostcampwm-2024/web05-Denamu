import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiQuery } from '@nestjs/swagger';

import {
  ApiBadRequestDoc,
  ApiDataResponse,
} from '@common/swagger/swagger.helper';
import { ReadStatisticAllResponseDto } from '@statistic/dto/response/readStatisticAll.dto';
import { ReadStatisticTodayResponseDto } from '@statistic/dto/response/readStatisticToday.dto';

export function ApiReadStatistic(category: 'today' | 'all') {
  const type = category === 'all' ? '전체' : '금일';
  const responseDto =
    category === 'all' ? ReadStatisticAllResponseDto : ReadStatisticTodayResponseDto;

  return applyDecorators(
    ApiOperation({ summary: `${type} 게시글 조회수 통계 API` }),
    ApiQuery({
      name: 'limit',
      required: false,
      type: Number,
      description: '가지고 올 게시글 수',
      example: 10,
    }),
    ApiDataResponse(responseDto, true, `${type} 조회수 통계 조회 성공`),
    ApiBadRequestDoc('요청 데이터 검증에 실패했습니다.'),
  );
}
