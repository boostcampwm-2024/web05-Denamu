import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CurrentAdmin } from '@common/decorator/current-admin.decorator';
import { AdminAuthGuard } from '@common/guard/session.guard';
import { ApiResponse } from '@common/response/common.response';

import { ApiGetAdminMarketingEmails } from '@marketingEmail/api-docs/getAdminMarketingEmails.api-docs';
import { ApiSendMarketingEmail } from '@marketingEmail/api-docs/sendMarketingEmail.api-docs';
import { GetAdminMarketingEmailsRequestDto } from '@marketingEmail/dto/request/getAdminMarketingEmails.dto';
import { SendMarketingEmailRequestDto } from '@marketingEmail/dto/request/sendMarketingEmail.dto';
import { MarketingEmailService } from '@marketingEmail/service/marketingEmail.service';

@ApiTags('Admin')
@Controller('admins/marketing-emails')
@UseGuards(AdminAuthGuard)
export class AdminMarketingEmailController {
  constructor(private readonly marketingEmailService: MarketingEmailService) {}

  @ApiGetAdminMarketingEmails()
  @Get()
  @HttpCode(HttpStatus.OK)
  async getAdminMarketingEmails(
    @Query() queryDto: GetAdminMarketingEmailsRequestDto,
  ) {
    return ApiResponse.responseWithData(
      '발송 이력 조회를 성공했습니다.',
      await this.marketingEmailService.getAdminMarketingEmails(queryDto),
    );
  }

  @ApiSendMarketingEmail()
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async sendMarketingEmail(
    @CurrentAdmin() email: string,
    @Body() bodyDto: SendMarketingEmailRequestDto,
  ) {
    return ApiResponse.responseWithData(
      '이메일이 성공적으로 발송되었습니다.',
      await this.marketingEmailService.sendMarketingEmail(email, bodyDto),
    );
  }
}
