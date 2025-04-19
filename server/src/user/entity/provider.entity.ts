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
import { User } from './user.entity';

@Entity({
  name: 'provider',
})
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
    name: 'refresh_token',
  })
  refreshToken: string;

  @Column({
    name: 'access_token',
  })
  accessToken: string;

  @Column({
    name: 'access_token_expires_at',
  })
  accessTokenExpiresAt: Date;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.providers, {
    nullable: false,
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
