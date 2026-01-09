import { Global, Module } from '@nestjs/common';
import { EmailProducer } from '@common/email/email.producer';

@Global()
@Module({
  imports: [],
  providers: [EmailProducer],
  exports: [EmailProducer],
})
export class EmailModule {}
