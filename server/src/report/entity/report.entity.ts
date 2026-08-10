import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

import { Comment } from '@comment/entity/comment.entity';

import { Feed } from '@feed/entity/feed.entity';

import {
  ReportReason,
  ReportTargetType,
} from '@report/constant/report.constant';

import { RssAccept } from '@rss/entity/rss.entity';

import { User } from '@user/entity/user.entity';

@Entity({ name: 'report' })
@Unique('UQ_report_reporter_id_target_type_target_id', [
  'reporter',
  'targetType',
  'targetId',
])
export class Report extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'target_type', length: 20, nullable: false })
  targetType: ReportTargetType;

  @Column({ name: 'target_id', type: 'int', nullable: false })
  targetId: number;

  @Column({ length: 20, nullable: false })
  reason: ReportReason;

  @Column({ type: 'text', nullable: true })
  detail: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'datetime', nullable: false })
  createdAt: Date;

  @Column({ name: 'reviewed_at', type: 'datetime', nullable: true })
  reviewedAt: Date | null;

  @ManyToOne(() => User, (user) => user.id, {
    nullable: true,
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  })
  @JoinColumn({
    name: 'reporter_id',
    foreignKeyConstraintName: 'FK_report_reporter_id',
  })
  reporter: User | null;

  @ManyToOne(() => User, (user) => user.id, {
    nullable: true,
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'reported_user_id',
    foreignKeyConstraintName: 'FK_report_reported_user_id',
  })
  reportedUser: User | null;

  @ManyToOne(() => RssAccept, (rssAccept) => rssAccept.id, {
    nullable: true,
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'reported_rss_id',
    foreignKeyConstraintName: 'FK_report_reported_rss_id',
  })
  reportedRss: RssAccept | null;

  @ManyToOne(() => Comment, (comment) => comment.id, {
    nullable: true,
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'reported_comment_id',
    foreignKeyConstraintName: 'FK_report_reported_comment_id',
  })
  reportedComment: Comment | null;

  @ManyToOne(() => Feed, (feed) => feed.id, {
    nullable: true,
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'reported_feed_id',
    foreignKeyConstraintName: 'FK_report_reported_feed_id',
  })
  reportedFeed: Feed | null;
}
