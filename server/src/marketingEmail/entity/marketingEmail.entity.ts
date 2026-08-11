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

@Entity({ name: 'marketing_email' })
export class MarketingEmail extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255, nullable: false })
  subject: string;

  @Column({ type: 'longtext', nullable: false })
  content: string;

  @Column({ name: 'recipient_count', type: 'int', nullable: false })
  recipientCount: number;

  @ManyToOne(() => Admin, {
    nullable: true,
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  })
  @JoinColumn({
    name: 'author_admin_id',
    foreignKeyConstraintName: 'FK_marketing_email_author_admin_id',
  })
  author: Admin | null;

  @CreateDateColumn({ name: 'created_at', type: 'datetime', nullable: false })
  createdAt: Date;
}
