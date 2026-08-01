import {
  BaseEntity,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

import { User } from '@user/entity/user.entity';

@Entity({ name: 'blocks' })
@Unique('UQ_blocks_blocker_id_blocked_id', ['blocker', 'blocked'])
export class UserBlock extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.id, {
    nullable: false,
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'blocker_id',
    foreignKeyConstraintName: 'FK_blocks_blocker_id',
  })
  blocker: User;

  @ManyToOne(() => User, (user) => user.id, {
    nullable: false,
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'blocked_id',
    foreignKeyConstraintName: 'FK_blocks_blocked_id',
  })
  blocked: User;

  @CreateDateColumn({
    name: 'created_at',
    type: 'datetime',
    nullable: false,
  })
  createdAt: Date;
}
