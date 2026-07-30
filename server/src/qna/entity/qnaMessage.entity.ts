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

import { QnaMessageType } from '@qna/constant/qna.constant';
import { Qna } from '@qna/entity/qna.entity';

@Entity({ name: 'qna_message' })
export class QnaMessage extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Qna, (qna) => qna.messages, {
    nullable: false,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({
    name: 'qna_id',
    foreignKeyConstraintName: 'FK_qna_message_qna_id',
  })
  qna: Qna;

  @Column({ length: 10, nullable: false })
  type: QnaMessageType;

  @Column({ type: 'longtext', nullable: false })
  content: string;

  @ManyToOne(() => Admin, {
    nullable: true,
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({
    name: 'admin_id',
    foreignKeyConstraintName: 'FK_qna_message_admin_id',
  })
  admin: Admin | null;

  @CreateDateColumn({ name: 'created_at', type: 'datetime', nullable: false })
  createdAt: Date;
}
