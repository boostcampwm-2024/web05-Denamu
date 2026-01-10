import { FileController } from '@file/controller/file.controller';
import { FileRepository } from '@file/repository/file.repository';
import { FileService } from '@file/service/file.service';

import { Module } from '@nestjs/common';

@Module({
  imports: [],
  controllers: [FileController],
  providers: [FileService, FileRepository],
  exports: [FileService],
})
export class FileModule {}
