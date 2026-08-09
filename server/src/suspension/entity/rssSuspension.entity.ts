import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Admin } from '@admin/entity/admin.entity';

import { RssAccept } from '@rss/entity/rss.entity';

@Entity({ name: 'rss_suspension' })
export class RssSuspension extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => RssAccept, {
    nullable: false,
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'rss_id',
    foreignKeyConstraintName: 'FK_rss_suspension_rss_id',
  })
  rss: RssAccept;

  @ManyToOne(() => Admin, {
    nullable: true,
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  })
  @JoinColumn({
    name: 'admin_id',
    foreignKeyConstraintName: 'FK_rss_suspension_admin_id',
  })
  admin: Admin | null;

  @Column({ type: 'text', nullable: false })
  detail: string;

  @Column({ name: 'suspended_until', type: 'datetime', nullable: true })
  suspendedUntil: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'datetime', nullable: false })
  createdAt: Date;
}
