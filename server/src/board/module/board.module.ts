import { Module } from '@nestjs/common';

import { AdminBoardController } from '@board/controller/adminBoard.controller';
import { BoardController } from '@board/controller/board.controller';
import { BoardRepository } from '@board/repository/board.repository';
import { BoardService } from '@board/service/board.service';

import { AdminModule } from '@admin/module/admin.module';

@Module({
  imports: [AdminModule],
  controllers: [BoardController, AdminBoardController],
  providers: [BoardService, BoardRepository],
  exports: [],
})
export class BoardModule {}
