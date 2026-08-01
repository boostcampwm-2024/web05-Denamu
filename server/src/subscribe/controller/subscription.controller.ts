import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '@common/decorator';
import { JwtGuard, OptionalJwtGuard, Payload } from '@common/guard/jwt.guard';
import { ApiResponse } from '@common/response/common.response';

import { ApiCreateSubscription } from '@subscribe/api-docs/createSubscription.api-docs';
import { ApiDeleteSubscription } from '@subscribe/api-docs/deleteSubscription.api-docs';
import { ApiGetSubscribers } from '@subscribe/api-docs/getSubscribers.api-docs';
import { ApiGetSubscription } from '@subscribe/api-docs/getSubscription.api-docs';
import { GetSubscribersRequestDto } from '@subscribe/dto/request/getSubscribers.dto';
import { ManageSubscriptionRequestDto } from '@subscribe/dto/request/manageSubscription.dto';
import { SubscriptionService } from '@subscribe/service/subscription.service';

@ApiTags('Subscription')
@Controller('rss/:rssId')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @ApiGetSubscription()
  @Get('subscriptions')
  @HttpCode(HttpStatus.OK)
  @UseGuards(OptionalJwtGuard)
  async getSubscription(
    @CurrentUser() user: Payload | null,
    @Param() paramDto: ManageSubscriptionRequestDto,
  ) {
    return ApiResponse.responseWithData(
      '구독 상태 조회를 성공했습니다.',
      await this.subscriptionService.getStatus(user, paramDto),
    );
  }

  @ApiCreateSubscription()
  @Post('subscriptions')
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.CREATED)
  async createSubscription(
    @CurrentUser() user: Payload,
    @Param() paramDto: ManageSubscriptionRequestDto,
  ) {
    await this.subscriptionService.create(user, paramDto);
    return ApiResponse.responseWithNoContent('구독 등록을 성공했습니다.');
  }

  @ApiDeleteSubscription()
  @Delete('subscriptions')
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.OK)
  async deleteSubscription(
    @CurrentUser() user: Payload,
    @Param() paramDto: ManageSubscriptionRequestDto,
  ) {
    await this.subscriptionService.delete(user, paramDto);
    return ApiResponse.responseWithNoContent('구독 해제를 성공했습니다.');
  }

  @ApiGetSubscribers()
  @Get('subscribers')
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.OK)
  async getSubscribers(
    @CurrentUser() user: Payload,
    @Param() paramDto: ManageSubscriptionRequestDto,
    @Query() queryDto: GetSubscribersRequestDto,
  ) {
    return ApiResponse.responseWithData(
      'RSS 구독자 조회를 성공했습니다.',
      await this.subscriptionService.getSubscribers(user, paramDto, queryDto),
    );
  }
}
