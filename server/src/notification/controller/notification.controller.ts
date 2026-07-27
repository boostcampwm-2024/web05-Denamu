import { Controller, Get, HttpCode, HttpStatus, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '@common/decorator';
import { JwtGuard, Payload } from '@common/guard/jwt.guard';
import { ApiResponse } from '@common/response/common.response';

import { ApiGetNotifications } from '@notification/api-docs/getNotifications.api-docs';
import { ApiGetUnreadCount } from '@notification/api-docs/getUnreadCount.api-docs';
import { ApiReadNotification } from '@notification/api-docs/readNotification.api-docs';
import { GetNotificationsRequestDto } from '@notification/dto/request/getNotifications.dto';
import { ReadNotificationParamRequestDto } from '@notification/dto/request/readNotificationParam.dto';
import { NotificationService } from '@notification/service/notification.service';

@ApiTags('Notification')
@Controller('notifications')
@UseGuards(JwtGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @ApiGetUnreadCount()
  @Get('unread-count')
  @HttpCode(HttpStatus.OK)
  async getUnreadCount(@CurrentUser() user: Payload) {
    return ApiResponse.responseWithData(
      '읽지 않은 알림 개수 조회를 성공했습니다.',
      await this.notificationService.getUnreadCount(user.id),
    );
  }

  @ApiGetNotifications()
  @Get()
  @HttpCode(HttpStatus.OK)
  async getNotifications(
    @CurrentUser() user: Payload,
    @Query() queryDto: GetNotificationsRequestDto,
  ) {
    return ApiResponse.responseWithData(
      '알림 목록 조회를 성공했습니다.',
      await this.notificationService.getNotifications(user.id, queryDto.limit ?? 20),
    );
  }

  @ApiReadNotification()
  @Patch(':notificationId/read')
  @HttpCode(HttpStatus.OK)
  async readNotification(
    @CurrentUser() user: Payload,
    @Param() paramDto: ReadNotificationParamRequestDto,
  ) {
    await this.notificationService.markAsRead(paramDto.notificationId, user.id);
    return ApiResponse.responseWithNoContent('알림 읽음 처리를 성공했습니다.');
  }
}
