import {
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  HttpCode,
  HttpStatus,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';

import { ApiCreateBoard } from '@board/api-docs/createBoard.api-docs';
import { ApiDeleteBoard } from '@board/api-docs/deleteBoard.api-docs';
import { ApiGetAdminBoard } from '@board/api-docs/getAdminBoard.api-docs';
import { ApiGetAdminBoards } from '@board/api-docs/getAdminBoards.api-docs';
import { ApiUpdateBoard } from '@board/api-docs/updateBoard.api-docs';
import { ApiUploadBoardImage } from '@board/api-docs/uploadBoardImage.api-docs';
import { CreateBoardRequestDto } from '@board/dto/request/createBoard.dto';
import { GetAdminBoardsRequestDto } from '@board/dto/request/getAdminBoards.dto';
import { GetBoardRequestDto } from '@board/dto/request/getBoard.dto';
import { UpdateBoardRequestDto } from '@board/dto/request/updateBoard.dto';
import { UploadBoardImageResponseDto } from '@board/dto/response/uploadBoardImage.dto';
import { BoardService } from '@board/service/board.service';

import { CurrentAdmin } from '@common/decorator/current-admin.decorator';
import { AdminAuthGuard } from '@common/guard/session.guard';
import { ApiResponse } from '@common/response/common.response';

import { FILE_SIZE_LIMITS, FileUploadType } from '@file/constant/file.constant';
import { FileService } from '@file/service/file.service';

@ApiTags('Admin')
@Controller('admins/boards')
@UseGuards(AdminAuthGuard)
export class AdminBoardController {
  constructor(
    private readonly boardService: BoardService,
    private readonly fileService: FileService,
  ) {}

  @ApiUploadBoardImage()
  @Post('images')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            maxSize: FILE_SIZE_LIMITS.IMAGE,
            message: `파일 크기는 ${FILE_SIZE_LIMITS.IMAGE / (1024 * 1024)}MB를 초과할 수 없습니다.`,
          }),
          new FileTypeValidator({
            fileType: /image\/(png|jpg|jpeg|webp|gif)/,
            skipMagicNumbersValidation: true,
          }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    const url = await this.fileService.saveWithoutOwner(
      file,
      FileUploadType.BOARD_IMAGE,
    );
    return ApiResponse.responseWithData(
      '이미지 업로드에 성공했습니다.',
      new UploadBoardImageResponseDto(url),
    );
  }

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
