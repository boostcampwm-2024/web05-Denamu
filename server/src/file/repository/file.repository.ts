import { Injectable } from '@nestjs/common';

import { DataSource, LessThan, Like, Repository } from 'typeorm';

import { FileUploadType } from '@file/constant/file.constant';
import { File } from '@file/entity/file.entity';

@Injectable()
export class FileRepository extends Repository<File> {
  constructor(private dataSource: DataSource) {
    super(File, dataSource.createEntityManager());
  }

  async findOldByUploadType(uploadType: FileUploadType, before: Date) {
    return this.find({
      where: {
        path: Like(`%/${uploadType}/%`),
        createdAt: LessThan(before),
      },
    });
  }
}
