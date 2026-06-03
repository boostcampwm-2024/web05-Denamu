import { forwardRef, Module } from '@nestjs/common';

import { FileController } from '@file/controller/file.controller';
import { FileRepository } from '@file/repository/file.repository';
import { FileService } from '@file/service/file.service';

import { UserModule } from '@user/module/user.module';

@Module({
  imports: [forwardRef(() => UserModule)],
  controllers: [FileController],
  providers: [FileService, FileRepository],
  exports: [FileService],
})
export class FileModule {}
