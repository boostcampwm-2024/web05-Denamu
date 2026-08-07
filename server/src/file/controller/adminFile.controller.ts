import {
  Controller,
  FileTypeValidator,
  HttpCode,
  HttpStatus,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';

import { AdminAuthGuard } from '@common/guard/session.guard';
import { ApiResponse } from '@common/response/common.response';

import { ApiUploadAdminImage } from '@file/api-docs/uploadAdminImage.api-docs';
import { FILE_SIZE_LIMITS } from '@file/constant/file.constant';
import { UploadAdminImageRequestDto } from '@file/dto/request/uploadAdminImage.dto';
import { UploadImageResponseDto } from '@file/dto/response/uploadImage.dto';
import { FileService } from '@file/service/file.service';

@ApiTags('Admin')
@Controller('admins/images')
@UseGuards(AdminAuthGuard)
export class AdminFileController {
  constructor(private readonly fileService: FileService) {}

  @ApiUploadAdminImage()
  @Post()
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
    @Query() query: UploadAdminImageRequestDto,
  ) {
    const url = await this.fileService.saveWithoutOwner(file, query.uploadType);
    return ApiResponse.responseWithData(
      '이미지 업로드에 성공했습니다.',
      new UploadImageResponseDto(url),
    );
  }
}
