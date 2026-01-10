import { EmailProducer } from '@common/email/email.producer';

import { Global, Module } from '@nestjs/common';

@Global()
@Module({
  imports: [],
  providers: [EmailProducer],
  exports: [EmailProducer],
})
export class EmailModule {}
