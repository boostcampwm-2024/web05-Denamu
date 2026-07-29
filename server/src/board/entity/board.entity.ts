import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Admin } from '@admin/entity/admin.entity';

import { BoardStatus } from '@board/constant/board.constant';

@Entity({ name: 'board' })
export class Board extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255, nullable: false })
  title: string;

  @Column({ type: 'longtext', nullable: false })
  content: string;

  @Column({ length: 20, nullable: false, default: BoardStatus.DRAFT })
  status: BoardStatus;

  @Column({ name: 'is_pinned', type: 'boolean', nullable: false, default: false })
  isPinned: boolean;

  @Column({ name: 'start_at', type: 'datetime', nullable: true })
  startAt: Date | null;

  @Column({ name: 'end_at', type: 'datetime', nullable: true })
  endAt: Date | null;

  @ManyToOne(() => Admin, {
    nullable: true,
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  })
  @JoinColumn({
    name: 'author_admin_id',
    foreignKeyConstraintName: 'FK_board_author_admin_id',
  })
  author: Admin | null;

  @CreateDateColumn({ name: 'created_at', type: 'datetime', nullable: false })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime', nullable: false })
  updatedAt: Date;
}
