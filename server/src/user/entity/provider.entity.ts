import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { User } from '@user/entity/user.entity';

@Entity({
  name: 'provider',
})
@Index('UQ_provider_type_user_id', ['providerType', 'providerUserId'], {
  unique: true,
})
@Index('UQ_user_provider_type', ['user', 'providerType'], { unique: true })
export class Provider extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'provider_type',
  })
  providerType: string;

  @Column({
    name: 'provider_user_id',
  })
  providerUserId: string;

  @Column({
    name: 'provider_user_name',
    nullable: true,
  })
  providerUserName: string | null;

  @Column({
    name: 'refresh_token',
    nullable: true,
  })
  refreshToken: string | null;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt: Date;

  @ManyToOne(() => User, {
    nullable: false,
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'user_id',
    foreignKeyConstraintName: 'FK_provider_user_id',
  })
  user: User;
}
