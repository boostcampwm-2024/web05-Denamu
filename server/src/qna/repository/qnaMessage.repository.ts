import { Injectable } from '@nestjs/common';

import { DataSource, Repository } from 'typeorm';

import { QnaMessage } from '@qna/entity/qnaMessage.entity';

@Injectable()
export class QnaMessageRepository extends Repository<QnaMessage> {
  constructor(private dataSource: DataSource) {
    super(QnaMessage, dataSource.createEntityManager());
  }
}
