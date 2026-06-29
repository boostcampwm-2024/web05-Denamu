import { Controller, Get, HttpCode, HttpStatus, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { ApiResponse } from '@common/response/common.response';

import { ApiGetUserSubscriptions } from '@subscribe/api-docs/getMySubscriptions.api-docs';
import { GetUserSubscriptionsParamRequestDto } from '@subscribe/dto/request/getUserSubscriptionsParam.dto';
import { SubscriptionService } from '@subscribe/service/subscription.service';

@ApiTags('Subscription')
@Controller('users/:userId/subscriptions')
export class UserSubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @ApiGetUserSubscriptions()
  @Get()
  @HttpCode(HttpStatus.OK)
  async getUserSubscriptions(
    @Param() paramDto: GetUserSubscriptionsParamRequestDto,
  ) {
    return ApiResponse.responseWithData(
      '구독 목록 조회를 성공했습니다.',
      await this.subscriptionService.getUserSubscriptions(paramDto.userId),
    );
  }
}
