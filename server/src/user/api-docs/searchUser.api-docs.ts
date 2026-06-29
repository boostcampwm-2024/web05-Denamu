import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiQuery } from '@nestjs/swagger';

import {
  ApiBadRequestDoc,
  ApiDataResponse,
} from '@common/swagger/swagger.helper';

import { SearchUserResponseDto } from '@user/dto/response/searchUser.dto';

export function ApiSearchUser() {
  return applyDecorators(
    ApiOperation({
      summary: '유저 닉네임 검색 API',
      description:
        '닉네임 부분 일치(LIKE)로 유저를 검색합니다. 결과는 id, 닉네임, 프로필 이미지를 포함합니다.',
    }),
    ApiQuery({
      name: 'find',
      required: true,
      type: String,
      description: '검색할 유저 닉네임',
      example: '김개발',
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
    ApiDataResponse(SearchUserResponseDto, false, '유저 검색 결과 조회 성공'),
    ApiBadRequestDoc('요청 데이터 검증에 실패했습니다.'),
  );
}
