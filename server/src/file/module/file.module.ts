import { Module } from '@nestjs/common';

import { BoardRepository } from '@board/repository/board.repository';

import { FileController } from '@file/controller/file.controller';
import { FileRepository } from '@file/repository/file.repository';
import { FileScheduler } from '@file/scheduler/file.scheduler';
import { FileService } from '@file/service/file.service';

import { UserRepository } from '@user/repository/user.repository';

@Module({
  controllers: [FileController],
  providers: [
    FileService,
    FileRepository,
    UserRepository,
    BoardRepository,
    FileScheduler,
  ],
  exports: [FileService],
})
export class FileModule {}
