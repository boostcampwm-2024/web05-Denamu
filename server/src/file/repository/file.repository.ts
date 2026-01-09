import { Injectable } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { File } from '@file/entity/file.entity';

@Injectable()
export class FileRepository extends Repository<File> {
  constructor(private dataSource: DataSource) {
    super(File, dataSource.createEntityManager());
  }
}
