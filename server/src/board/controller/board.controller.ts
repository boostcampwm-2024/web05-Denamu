import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { ApiGetBoard } from '@board/api-docs/getBoard.api-docs';
import { ApiGetBoards } from '@board/api-docs/getBoards.api-docs';
import { GetBoardRequestDto } from '@board/dto/request/getBoard.dto';
import { GetBoardsRequestDto } from '@board/dto/request/getBoards.dto';
import { BoardService } from '@board/service/board.service';

import { ApiResponse } from '@common/response/common.response';

@ApiTags('Board')
@Controller('boards')
export class BoardController {
  constructor(private readonly boardService: BoardService) {}

  @ApiGetBoards()
  @Get()
  @HttpCode(HttpStatus.OK)
  async getBoards(@Query() queryDto: GetBoardsRequestDto) {
    return ApiResponse.responseWithData(
      '게시글 목록 조회를 성공했습니다.',
      await this.boardService.getPublicBoards(queryDto),
    );
  }

  @ApiGetBoard()
  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  async getBoard(@Param() paramDto: GetBoardRequestDto) {
    return ApiResponse.responseWithData(
      '게시글 상세 조회를 성공했습니다.',
      await this.boardService.getPublicBoard(paramDto.id),
    );
  }
}
