import { Injectable, NotFoundException } from '@nestjs/common';
import { File } from '../entity/file.entity';
import { unlink, access } from 'fs/promises';
import { FileRepository } from '../repository/file.repository';
import { UploadFileResponseDto } from '../dto/response/uploadFile.dto';
import { WinstonLoggerService } from '../../common/logger/logger.service';
import * as fs from 'fs/promises';
import * as path from 'path';
import { FileUploadType } from '../constant/file.constant';
import * as uuid from 'uuid';

@Injectable()
export class FileService {
  private readonly basePath = '/app/objects';

  constructor(
    private readonly fileRepository: FileRepository,
    private readonly logger: WinstonLoggerService,
  ) {}

  async handleUpload(file: Express.Multer.File, uploadType: FileUploadType) {
    const today = this.getDateString();
    const targetDir = path.join(this.basePath, uploadType, today);

    await this.ensureDirectory(targetDir);

    const ext = path.extname(file.originalname);
    const fileName = `${uuid.v4()}${ext}`;
    const filePath = path.join(targetDir, fileName);

    await fs.writeFile(filePath, file.buffer);

    return filePath;
  }

  private async ensureDirectory(dir: string) {
    await fs.mkdir(dir, { recursive: true });
  }

  private getDateString(): string {
    const now = new Date();
    return now.toISOString().split('T')[0];
  }

  async create(
    file: Express.Multer.File,
    userId: number,
  ): Promise<UploadFileResponseDto> {
    const { originalname, mimetype, size, path } = file;
    const savedFile = await this.fileRepository.save({
      originalName: originalname,
      mimetype,
      size,
      path,
      user: { id: userId },
    });
    const accessUrl = this.generateAccessUrl(path);

    return UploadFileResponseDto.toResponseDto(savedFile, accessUrl);
  }

  private generateAccessUrl(filePath: string): string {
    return filePath.replace(this.basePath, '/objects');
  }

  async findById(id: number): Promise<File> {
    const file = await this.fileRepository.findOne({ where: { id } });
    if (!file) {
      throw new NotFoundException('파일을 찾을 수 없습니다.');
    }
    return file;
  }

  async deleteFile(id: number): Promise<void> {
    const file = await this.findById(id);

    try {
      await access(file.path);
      await unlink(file.path);
    } catch (error) {
      this.logger.warn(`파일 삭제 실패: ${file.path}`, 'FileService');
    }

    await this.fileRepository.delete(id);
  }

  async getFileInfo(id: number): Promise<File> {
    return this.findById(id);
  }

  async deleteByPath(path: string): Promise<void> {
    const file = await this.fileRepository.findOne({ where: { path } });
    if (file) {
      try {
        await access(file.path);
        await unlink(file.path);
      } catch (error) {
        this.logger.warn(`파일 삭제 실패: ${file.path}`, 'FileService');
      }

      await this.fileRepository.delete(file.id);
    } else {
      throw new NotFoundException('파일을 찾을 수 없습니다.');
    }
  }
}
