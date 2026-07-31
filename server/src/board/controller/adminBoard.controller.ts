import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { ApiCreateBoard } from '@board/api-docs/createBoard.api-docs';
import { ApiDeleteBoard } from '@board/api-docs/deleteBoard.api-docs';
import { ApiGetAdminBoard } from '@board/api-docs/getAdminBoard.api-docs';
import { ApiGetAdminBoards } from '@board/api-docs/getAdminBoards.api-docs';
import { ApiUpdateBoard } from '@board/api-docs/updateBoard.api-docs';
import { CreateBoardRequestDto } from '@board/dto/request/createBoard.dto';
import { GetAdminBoardsRequestDto } from '@board/dto/request/getAdminBoards.dto';
import { GetBoardRequestDto } from '@board/dto/request/getBoard.dto';
import { UpdateBoardRequestDto } from '@board/dto/request/updateBoard.dto';
import { BoardService } from '@board/service/board.service';

import { CurrentAdmin } from '@common/decorator/current-admin.decorator';
import { AdminAuthGuard } from '@common/guard/session.guard';
import { ApiResponse } from '@common/response/common.response';

@ApiTags('Admin')
@Controller('admins/boards')
@UseGuards(AdminAuthGuard)
export class AdminBoardController {
  constructor(private readonly boardService: BoardService) {}

  @ApiGetAdminBoards()
  @Get()
  @HttpCode(HttpStatus.OK)
  async getAdminBoards(@Query() queryDto: GetAdminBoardsRequestDto) {
    return ApiResponse.responseWithData(
      '게시글 목록 조회를 성공했습니다.',
      await this.boardService.getAdminBoards(queryDto),
    );
  }

  @ApiGetAdminBoard()
  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  async getAdminBoard(@Param() paramDto: GetBoardRequestDto) {
    return ApiResponse.responseWithData(
      '게시글 상세 조회를 성공했습니다.',
      await this.boardService.getAdminBoard(paramDto.id),
    );
  }

  @ApiCreateBoard()
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createBoard(
    @CurrentAdmin() email: string,
    @Body() bodyDto: CreateBoardRequestDto,
  ) {
    return ApiResponse.responseWithData(
      '게시글이 성공적으로 작성되었습니다.',
      await this.boardService.createBoard(email, bodyDto),
    );
  }

  @ApiUpdateBoard()
  @Patch('/:id')
  @HttpCode(HttpStatus.OK)
  async updateBoard(
    @Param() paramDto: GetBoardRequestDto,
    @Body() bodyDto: UpdateBoardRequestDto,
  ) {
    return ApiResponse.responseWithData(
      '게시글이 성공적으로 수정되었습니다.',
      await this.boardService.updateBoard(paramDto.id, bodyDto),
    );
  }

  @ApiDeleteBoard()
  @Delete('/:id')
  @HttpCode(HttpStatus.OK)
  async deleteBoard(@Param() paramDto: GetBoardRequestDto) {
    await this.boardService.deleteBoard(paramDto.id);
    return ApiResponse.responseWithNoContent(
      '게시글이 성공적으로 삭제되었습니다.',
    );
  }
}
