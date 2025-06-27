import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileController } from '../controller/file.controller';
import { FileService } from '../service/file.service';
import { FileRepository } from '../repository/file.repository';

@Module({
  imports: [],
  controllers: [FileController],
  providers: [FileService, FileRepository],
  exports: [FileService],
})
export class FileModule {}
