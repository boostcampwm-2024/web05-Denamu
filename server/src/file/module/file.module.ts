import { Module } from '@nestjs/common';
import { FileController } from '@src/file/controller/file.controller';
import { FileService } from '@src/file/service/file.service';
import { FileRepository } from '@src/file/repository/file.repository';

@Module({
  imports: [],
  controllers: [FileController],
  providers: [FileService, FileRepository],
  exports: [FileService],
})
export class FileModule {}
