import { File } from '@file/entity/file.entity';

import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class FileRepository extends Repository<File> {
  constructor(private dataSource: DataSource) {
    super(File, dataSource.createEntityManager());
  }
}
