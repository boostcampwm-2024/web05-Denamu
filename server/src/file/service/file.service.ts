import { Injectable, NotFoundException } from '@nestjs/common';
import { File } from '../entity/file.entity';
import { unlink, access } from 'fs/promises';
import { FileRepository } from '../repository/file.repository';
import { User } from '../../user/entity/user.entity';
import { FileUploadResponseDto } from '../dto/response/createFile.dto';
import { WinstonLoggerService } from '../../common/logger/logger.service';

@Injectable()
export class FileService {
  constructor(
    private readonly fileRepository: FileRepository,
    private readonly logger: WinstonLoggerService,
  ) {}

  async create(file: any, userId: number): Promise<FileUploadResponseDto> {
    const { originalname, mimetype, size, path } = file;

    const savedFile = await this.fileRepository.save({
      originalName: originalname,
      mimetype,
      size,
      path,
      user: { id: userId } as User,
    } as File);
    const accessUrl = this.generateAccessUrl(path);

    return FileUploadResponseDto.toResponseDto(savedFile, accessUrl);
  }

  private generateAccessUrl(filePath: string): string {
    const baseUploadPath = '/var/web05-Denamu/objects';
    const relativePath = filePath.replace(baseUploadPath, '');
    return `/objects${relativePath}`;
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
