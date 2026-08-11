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
      .leftJoin('reportedRss.user', 'reportedRssOwner')
      .leftJoin('report.reportedComment', 'reportedComment')
      .leftJoin('reportedComment.user', 'reportedCommentUser')
      .leftJoin('reportedComment.feed', 'reportedCommentFeed')
      .leftJoin('report.reportedFeed', 'reportedFeed')
      .leftJoin('reportedFeed.blog', 'reportedFeedBlog')
      .leftJoin('reportedFeedBlog.user', 'reportedFeedBlogOwner')
      .select(['report', 'reporter.userName'])
      .addSelect([
        'reportedUser.id',
        'reportedUser.userName',
        'reportedUser.profileImage',
      ])
      .addSelect([
        'reportedRss.id',
        'reportedRss.name',
        'reportedRss.blogImage',
      ])
      .addSelect([
        'reportedRssOwner.id',
        'reportedRssOwner.userName',
        'reportedRssOwner.profileImage',
      ])
      .addSelect(['reportedComment.id', 'reportedComment.comment'])
      .addSelect([
        'reportedCommentUser.id',
        'reportedCommentUser.userName',
        'reportedCommentUser.profileImage',
      ])
      .addSelect([
        'reportedCommentFeed.id',
        'reportedCommentFeed.title',
        'reportedCommentFeed.thumbnail',
      ])
      .addSelect([
        'reportedFeed.id',
        'reportedFeed.title',
        'reportedFeed.thumbnail',
      ])
      .addSelect([
        'reportedFeedBlog.id',
        'reportedFeedBlog.name',
        'reportedFeedBlog.blogImage',
      ])
      .addSelect([
        'reportedFeedBlogOwner.id',
        'reportedFeedBlogOwner.userName',
        'reportedFeedBlogOwner.profileImage',
      ]);

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
