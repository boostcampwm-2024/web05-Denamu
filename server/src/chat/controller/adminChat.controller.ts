import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import {
  ApiDeleteChatByAdmin,
  ApiGetChatMessages,
  ApiGetChatRooms,
} from '@chat/api-docs/adminChat.api-docs';
import { ChatGateway } from '@chat/chat.gateway';
import {
  AdminChatMessageParamDto,
  AdminChatRoomParamDto,
} from '@chat/dto/request/adminChatParam.dto';
import { AdminChatMessageDto } from '@chat/dto/response/adminChat.dto';
import { AnonymousRoomManager } from '@chat/room/anonymous-room.manager';
import { ChatService } from '@chat/service/chat.service';

import { AdminAuthGuard } from '@common/guard/session.guard';
import { ApiResponse } from '@common/response/common.response';

@ApiTags('Admin')
@Controller('admins/chats')
@UseGuards(AdminAuthGuard)
export class AdminChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly chatGateway: ChatGateway,
    private readonly roomManager: AnonymousRoomManager,
  ) {}

  @ApiGetChatRooms()
  @Get()
  @HttpCode(HttpStatus.OK)
  async getRooms() {
    const rooms = await Promise.all(
      this.roomManager.getAllRoomIds().map(async (roomId) => ({
        roomId,
        roomName: this.roomManager.getRoomName(roomId),
        messageCount: await this.chatService.getMessageCount(roomId),
        userCount: this.chatGateway.getRoomClientCount(roomId),
      })),
    );
    return ApiResponse.responseWithData('채팅방 목록 조회를 성공했습니다.', rooms);
  }

  @ApiGetChatMessages()
  @Get(':roomId')
  @HttpCode(HttpStatus.OK)
  async getMessages(@Param() paramDto: AdminChatRoomParamDto) {
    const messages = await this.chatService.getChatHistory(paramDto.roomId);
    return ApiResponse.responseWithData(
      '채팅 메시지 조회를 성공했습니다.',
      AdminChatMessageDto.toResponseDtoArray(messages),
    );
  }

  @ApiDeleteChatByAdmin()
  @Delete(':roomId/:messageId')
  @HttpCode(HttpStatus.OK)
  async deleteChat(@Param() paramDto: AdminChatMessageParamDto) {
    const deleted = await this.chatService.deleteMessageByAdmin(
      paramDto.roomId,
      paramDto.messageId,
    );
    if (!deleted) {
      throw new NotFoundException('존재하지 않는 채팅입니다.');
    }
    this.chatGateway.broadcastDeletedMessage(paramDto.roomId, deleted);
    return ApiResponse.responseWithNoContent('채팅이 성공적으로 삭제되었습니다.');
  }
}
