import { Global, Module } from '@nestjs/common';
import { TestService } from './test.service';

@Global()
@Module({
  imports: [],
  providers: [TestService],
  exports: [TestService],
})
export class TestModule {}
