import { applyDecorators } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiParam } from '@nestjs/swagger';

import { AdminChatMessageDto, AdminChatRoomDto } from '@chat/dto/response/adminChat.dto';

import {
  ApiDataResponse,
  ApiMessageResponse,
  ApiNotFoundDoc,
  ApiUnauthorizedDoc,
} from '@common/swagger/swagger.helper';

export function ApiGetChatRooms() {
  return applyDecorators(
    ApiCookieAuth('sessionId'),
    ApiOperation({ summary: '관리자 채팅방 목록 조회 API' }),
    ApiDataResponse(AdminChatRoomDto, true, '채팅방 목록 조회 성공'),
    ApiUnauthorizedDoc('인증되지 않은 요청입니다.'),
  );
}

export function ApiGetChatMessages() {
  return applyDecorators(
    ApiCookieAuth('sessionId'),
    ApiOperation({ summary: '관리자 채팅방 메시지 조회 API' }),
    ApiParam({ name: 'roomId', description: '채팅방 ID', example: 'anonymous1' }),
    ApiDataResponse(AdminChatMessageDto, true, '채팅 메시지 조회 성공'),
    ApiUnauthorizedDoc('인증되지 않은 요청입니다.'),
  );
}

export function ApiDeleteChatByAdmin() {
  return applyDecorators(
    ApiCookieAuth('sessionId'),
    ApiOperation({ summary: '관리자 채팅 삭제 API' }),
    ApiParam({ name: 'roomId', description: '채팅방 ID', example: 'anonymous1' }),
    ApiParam({
      name: 'messageId',
      description: '삭제할 메시지 ID',
      example: '550e8400-e29b-41d4-a716-446655440000',
    }),
    ApiMessageResponse('채팅이 성공적으로 삭제되었습니다.'),
    ApiUnauthorizedDoc('인증되지 않은 요청입니다.'),
    ApiNotFoundDoc('존재하지 않는 채팅입니다.'),
  );
}
