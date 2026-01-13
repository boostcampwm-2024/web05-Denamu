import { Module } from '@nestjs/common';
import { FileController } from '@file/controller/file.controller';
import { FileService } from '@file/service/file.service';
import { FileRepository } from '@file/repository/file.repository';

@Module({
  imports: [],
  controllers: [FileController],
  providers: [FileService, FileRepository],
  exports: [FileService],
})
export class FileModule {}
