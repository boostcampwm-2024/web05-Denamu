import { Global, Module } from '@nestjs/common';
import { EmailProducer } from './email.producer';

@Global()
@Module({
  imports: [],
  providers: [EmailProducer],
  exports: [EmailProducer],
})
export class EmailModule {}
