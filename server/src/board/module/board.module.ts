import { Module } from '@nestjs/common';

import { AdminBoardController } from '@board/controller/adminBoard.controller';
import { BoardController } from '@board/controller/board.controller';
import { BoardRepository } from '@board/repository/board.repository';
import { BoardService } from '@board/service/board.service';

import { AdminModule } from '@admin/module/admin.module';

import { FileModule } from '@file/module/file.module';

import { UserRepository } from '@user/repository/user.repository';

@Module({
  imports: [AdminModule, FileModule],
  controllers: [BoardController, AdminBoardController],
  providers: [BoardService, BoardRepository, UserRepository],
  exports: [],
})
export class BoardModule {}
