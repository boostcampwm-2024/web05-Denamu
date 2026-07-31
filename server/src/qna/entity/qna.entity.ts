import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { QnaStatus } from '@qna/constant/qna.constant';
import { QnaMessage } from '@qna/entity/qnaMessage.entity';

import { User } from '@user/entity/user.entity';

@Entity({ name: 'qna' })
export class Qna extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255, nullable: false })
  title: string;

  @Column({ name: 'is_secret', type: 'boolean', nullable: false, default: false })
  isSecret: boolean;

  @Column({ length: 60, nullable: true })
  password: string | null;

  @Column({ name: 'guest_name', length: 60, nullable: true })
  guestName: string | null;

  @Column({ name: 'guest_email', length: 255, nullable: true })
  guestEmail: string | null;

  @Column({ name: 'user_id', type: 'int', nullable: true })
  userId: number | null;

  @ManyToOne(() => User, {
    nullable: true,
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({
    name: 'user_id',
    foreignKeyConstraintName: 'FK_qna_user_id',
  })
  user: User | null;

  @Column({ length: 20, nullable: false, default: QnaStatus.PENDING })
  status: QnaStatus;

  @CreateDateColumn({ name: 'created_at', type: 'datetime', nullable: false })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime', nullable: false })
  updatedAt: Date;

  @OneToMany(() => QnaMessage, (message) => message.qna)
  messages: QnaMessage[];
}
