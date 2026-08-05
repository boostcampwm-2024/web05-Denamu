import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import * as fs from 'fs/promises';
import * as path from 'path';
import * as uuid from 'uuid';
import { access, unlink } from 'fs/promises';

import { WinstonLoggerService } from '@common/logger/logger.service';

import { FileUploadType } from '@file/constant/file.constant';
import { UploadFileResponseDto } from '@file/dto/response/uploadFile.dto';
import { File } from '@file/entity/file.entity';
import { FileRepository } from '@file/repository/file.repository';

@Injectable()
export class FileService {
  private readonly basePath = '/app/objects';

  constructor(
    private readonly fileRepository: FileRepository,
    private readonly logger: WinstonLoggerService,
  ) {}

  async handleUpload(
    file: Express.Multer.File,
    uploadType: FileUploadType,
    userId: number,
  ) {
    const filePath = await this.writeToDisk(file, uploadType);

    const { originalname, mimetype, size } = file;
    const savedFile = await this.fileRepository.save({
      originalName: originalname,
      mimetype,
      size,
      path: filePath,
      user: { id: userId },
    });
    const accessUrl = this.generateAccessUrl(filePath);

    return UploadFileResponseDto.toResponseDto(savedFile, accessUrl);
  }

  async saveWithoutOwner(
    file: Express.Multer.File,
    uploadType: FileUploadType,
  ): Promise<string> {
    const filePath = await this.writeToDisk(file, uploadType);
    return this.generateAccessUrl(filePath);
  }

  private async writeToDisk(
    file: Express.Multer.File,
    uploadType: FileUploadType,
  ): Promise<string> {
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

  private generateAccessUrl(filePath: string): string {
    return filePath.replace(this.basePath, '/objects');
  }

  private resolveInternalPath(accessUrl: string): string {
    return accessUrl.startsWith('/objects')
      ? accessUrl.replace('/objects', this.basePath)
      : accessUrl;
  }

  async findById(id: number): Promise<File> {
    const file = await this.fileRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!file) {
      throw new NotFoundException('파일을 찾을 수 없습니다.');
    }
    return file;
  }

  async deleteFile(id: number, userId: number): Promise<void> {
    const file = await this.findById(id);

    if (file.user.id !== userId) {
      throw new ForbiddenException('파일 삭제 권한이 없습니다.');
    }

    try {
      await access(file.path);
      await unlink(file.path);
    } catch {
      this.logger.warn(`파일 삭제 실패: ${file.path}`, 'FileService');
    }

    await this.fileRepository.delete(id);
  }

  async getFileInfo(id: number): Promise<File> {
    return this.findById(id);
  }

  async deleteUntracked(accessUrl: string): Promise<void> {
    const filePath = this.resolveInternalPath(accessUrl);
    try {
      await access(filePath);
      await unlink(filePath);
    } catch {
      this.logger.warn(`파일 삭제 실패: ${filePath}`, 'FileService');
    }
  }

  async deleteByPath(accessUrl: string): Promise<void> {
    const file = await this.fileRepository.findOne({
      where: { path: this.resolveInternalPath(accessUrl) },
    });
    if (!file) {
      return;
    }

    try {
      await access(file.path);
      await unlink(file.path);
    } catch {
      this.logger.warn(`파일 삭제 실패: ${file.path}`, 'FileService');
    }

    await this.fileRepository.delete(file.id);
  }
}
