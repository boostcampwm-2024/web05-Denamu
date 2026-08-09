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

import { User } from '@user/entity/user.entity';

@Entity({ name: 'user_suspension' })
export class UserSuspension extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, {
    nullable: false,
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'user_id',
    foreignKeyConstraintName: 'FK_user_suspension_user_id',
  })
  user: User;

  @ManyToOne(() => Admin, {
    nullable: true,
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  })
  @JoinColumn({
    name: 'admin_id',
    foreignKeyConstraintName: 'FK_user_suspension_admin_id',
  })
  admin: Admin | null;

  @Column({ type: 'text', nullable: false })
  detail: string;

  @Column({ name: 'suspended_until', type: 'datetime', nullable: true })
  suspendedUntil: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'datetime', nullable: false })
  createdAt: Date;
}
