import {
  Controller,
  Post,
  Delete,
  UseInterceptors,
  UploadedFile,
  Param,
  UseGuards,
  Query,
  HttpStatus,
  HttpCode,
  FileTypeValidator,
  MaxFileSizeValidator,
  ParseFilePipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileService } from '@file/service/file.service';
import { ApiTags } from '@nestjs/swagger';
import { JwtGuard, Payload } from '@common/guard/jwt.guard';
import { ApiResponse } from '@common/response/common.response';
import { ApiUploadProfileFile } from '@file/api-docs/uploadProfileFile.api-docs';
import { ApiDeleteFile } from '@file/api-docs/deleteFile.api-docs';
import { DeleteFileParamRequestDto } from '@file/dto/request/deleteFile.dto';
import { UploadFileQueryRequestDto } from '@file/dto/request/uploadFile.dto';
import { CurrentUser } from '@common/decorator';
import { FILE_SIZE_LIMITS } from '@file/constant/file.constant';

@ApiTags('File')
@Controller('file')
@UseGuards(JwtGuard)
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Post('')
  @ApiUploadProfileFile()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            maxSize: FILE_SIZE_LIMITS.IMAGE,
            message: `File size must not exceed ${FILE_SIZE_LIMITS.IMAGE / (1024 * 1024)}MB`,
          }),
          new FileTypeValidator({
            fileType: /image\/(png|jpg|jpeg|webp|gif)/,
            skipMagicNumbersValidation: true,
          }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Query() query: UploadFileQueryRequestDto,
    @CurrentUser() user: Payload,
  ) {
    return ApiResponse.responseWithData(
      '파일 업로드에 성공했습니다.',
      await this.fileService.handleUpload(file, query.uploadType, user.id),
    );
  }

  // TODO: 권한검사 추가
  @Delete(':id')
  @ApiDeleteFile()
  @HttpCode(HttpStatus.OK)
  async deleteFile(@Param() fileDeleteRequestDto: DeleteFileParamRequestDto) {
    await this.fileService.deleteFile(fileDeleteRequestDto.id);
    return ApiResponse.responseWithNoContent(
      '파일이 성공적으로 삭제되었습니다.',
    );
  }
}
