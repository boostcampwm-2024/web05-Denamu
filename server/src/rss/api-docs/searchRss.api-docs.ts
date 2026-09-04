import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiQuery } from '@nestjs/swagger';

import {
  ApiBadRequestDoc,
  ApiDataResponse,
} from '@common/swagger/swagger.helper';

import { RssListResponseDto } from '@rss/dto/response/rssList.dto';

export function ApiSearchRss() {
  return applyDecorators(
    ApiOperation({
      summary: 'RSS 블로그 이름 검색 API',
      description:
        '승인된 RSS(rss_accept) 중 블로그 이름으로 검색합니다. 결과는 id, 이름, 플랫폼, 프로필 이미지, 공개 게시글 개수를 포함합니다.',
    }),
    ApiQuery({
      name: 'find',
      required: true,
      type: String,
      description: '검색할 RSS 블로그 이름',
      example: 'seok3765',
    }),
    ApiQuery({
      name: 'page',
      required: false,
      type: Number,
      description: '페이지 번호',
      example: 1,
    }),
    ApiQuery({
      name: 'limit',
      required: false,
      type: Number,
      description: '한 페이지에 보여줄 개수',
      example: 5,
    }),
    ApiDataResponse(RssListResponseDto, false, 'RSS 검색 결과 조회 성공'),
    ApiBadRequestDoc('요청 데이터 검증에 실패했습니다.'),
  );
}
