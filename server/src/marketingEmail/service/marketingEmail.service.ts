import { Injectable } from '@nestjs/common';

import { AdminRepository } from '@admin/repository/admin.repository';

import { EmailProducer } from '@common/email/email.producer';
import { WinstonLoggerService } from '@common/logger/logger.service';

import { GetAdminMarketingEmailsRequestDto } from '@marketingEmail/dto/request/getAdminMarketingEmails.dto';
import { SendMarketingEmailRequestDto } from '@marketingEmail/dto/request/sendMarketingEmail.dto';
import {
  MarketingEmailListResponseDto,
  MarketingEmailSummaryDto,
} from '@marketingEmail/dto/response/marketingEmail.dto';
import { MarketingEmailRepository } from '@marketingEmail/repository/marketingEmail.repository';

import { UserRepository } from '@user/repository/user.repository';

@Injectable()
export class MarketingEmailService {
  constructor(
    private readonly marketingEmailRepository: MarketingEmailRepository,
    private readonly adminRepository: AdminRepository,
    private readonly userRepository: UserRepository,
    private readonly emailProducer: EmailProducer,
    private readonly logger: WinstonLoggerService,
  ) {}

  async getAdminMarketingEmails(queryDto: GetAdminMarketingEmailsRequestDto) {
    const { page, limit } = queryDto;
    const { items, totalCount } =
      await this.marketingEmailRepository.findAdminList(page, limit);
    return MarketingEmailListResponseDto.toResponseDto(
      items,
      page,
      limit,
      totalCount,
    );
  }

  async sendMarketingEmail(
    authorEmail: string,
    dto: SendMarketingEmailRequestDto,
  ) {
    const recipients = await this.userRepository.findMarketingAgreedUsers();
    const author = await this.adminRepository.findOneBy({
      email: authorEmail,
    });

    const marketingEmail = this.marketingEmailRepository.create({
      subject: dto.subject,
      content: dto.content,
      recipientCount: recipients.length,
      author,
    });
    await this.marketingEmailRepository.save(marketingEmail);

    const results = await Promise.allSettled(
      recipients.map((recipient) =>
        this.emailProducer.produceMarketingBroadcast({
          email: recipient.email,
          userName: recipient.userName,
          subject: dto.subject,
          content: dto.content,
        }),
      ),
    );

    const failedCount = results.filter(
      (result) => result.status === 'rejected',
    ).length;
    if (failedCount > 0) {
      this.logger.error(
        `마케팅 이메일 발행 중 일부가 실패했습니다.: marketingEmailId=${marketingEmail.id}, failed=${failedCount}/${recipients.length}`,
      );
    }

    return MarketingEmailSummaryDto.toResultDto(marketingEmail);
  }
}
