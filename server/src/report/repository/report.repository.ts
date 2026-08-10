import { Injectable } from '@nestjs/common';

import { DataSource, Repository } from 'typeorm';

import { GetReportsRequestDto } from '@report/dto/request/getReports.dto';
import { Report } from '@report/entity/report.entity';

@Injectable()
export class ReportRepository extends Repository<Report> {
  constructor(private dataSource: DataSource) {
    super(Report, dataSource.createEntityManager());
  }

  async getReports(queryDto: GetReportsRequestDto) {
    const query = this.createQueryBuilder('report')
      .leftJoin('report.reporter', 'reporter')
      .leftJoin('report.reportedUser', 'reportedUser')
      .leftJoin('report.reportedRss', 'reportedRss')
      .leftJoin('report.reportedComment', 'reportedComment')
      .leftJoin('report.reportedFeed', 'reportedFeed')
      .select(['report', 'reporter.userName'])
      .addSelect(['reportedUser.id', 'reportedUser.userName'])
      .addSelect(['reportedRss.id', 'reportedRss.name'])
      .addSelect(['reportedComment.id', 'reportedComment.comment'])
      .addSelect(['reportedFeed.id', 'reportedFeed.title']);

    if (queryDto.targetType) {
      query.andWhere('report.target_type = :targetType', {
        targetType: queryDto.targetType,
      });
    }
    if (queryDto.lastId) {
      query.andWhere('report.id < :lastId', { lastId: queryDto.lastId });
    }

    return await query
      .orderBy('report.id', 'DESC')
      .take((queryDto.limit ?? 10) + 1)
      .getMany();
  }
}
