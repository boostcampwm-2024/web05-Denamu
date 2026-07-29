import * as uuid from 'uuid';

import { BoardStatus } from '@board/constant/board.constant';
import { Board } from '@board/entity/board.entity';

export const BOARD_DEFAULT_CONTENT = '<p>테스트 게시글 본문입니다.</p>';

export class BoardFixture {
  static createGeneralBoard() {
    return {
      title: `board${uuid.v4()}`,
      content: BOARD_DEFAULT_CONTENT,
      status: BoardStatus.PUBLISHED,
      isPinned: false,
      startAt: null,
      endAt: null,
      author: null,
    };
  }

  static createBoardFixture(overwrites: Partial<Board> = {}): Board {
    const board = new Board();
    return Object.assign(board, this.createGeneralBoard(), overwrites);
  }
}
