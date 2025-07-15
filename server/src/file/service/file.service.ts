import { Injectable, NotFoundException } from '@nestjs/common';
import { File } from '../entity/file.entity';
import { unlinkSync, existsSync } from 'fs';
import { FileRepository } from '../repository/file.repository';
import { User } from '../../user/entity/user.entity';

@Injectable()
export class FileService {
  constructor(private readonly fileRepository: FileRepository) {}

  async create(file: any, userId: number) {
    const { originalname, mimetype, size, path } = file;

    const entity = this.fileRepository.create({
      originalname,
      mimetype,
      size,
      path,
      user: { id: userId } as User,
    });
    return this.fileRepository.save(entity);
  }

  async findById(id: string): Promise<File> {
    const file = await this.fileRepository.findOne({ where: { id } });
    if (!file) {
      throw new NotFoundException('파일을 찾을 수 없습니다.');
    }
    return file;
  }

  async deleteFile(id: string): Promise<void> {
    const file = await this.findById(id);

    if (existsSync(file.path)) {
      unlinkSync(file.path);
    }

    await this.fileRepository.delete(id);
  }

  async getFileInfo(id: string): Promise<File> {
    return this.findById(id);
  }
}
