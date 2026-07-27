import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Activity } from '@activity/entity/activity.entity';

import { Provider } from '@user/entity/provider.entity';

@Entity({
  name: 'user',
})
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'email',
    length: 255,
    nullable: false,
    unique: true,
  })
  email: string;

  @Column({
    length: 60,
    nullable: true,
  })
  password: string;

  @Column({
    name: 'user_name',
    length: '60',
    nullable: false,
    unique: true,
  })
  userName: string;

  @Column({
    name: 'profile_image',
    nullable: true,
  })
  profileImage: string;

  @Column({
    name: 'introduction',
    nullable: true,
  })
  introduction: string;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt: Date;

  @Column({ type: 'int', default: 0 })
  totalViews: number;

  @Column({ type: 'int', default: 0 })
  currentStreak: number;

  @Column({ type: 'date', nullable: true })
  lastActiveDate: Date | null;

  @Column({ type: 'int', default: 0 })
  maxStreak: number;

  @Column({
    name: 'marketing_email_agreed',
    type: 'boolean',
    nullable: false,
    default: false,
  })
  marketingEmailAgreed: boolean;

  @Column({
    name: 'inactivity_email_agreed',
    type: 'boolean',
    nullable: false,
    default: true,
  })
  inactivityEmailAgreed: boolean;

  @Column({
    name: 'notice_email_agreed',
    type: 'boolean',
    nullable: false,
    default: true,
  })
  noticeEmailAgreed: boolean;

  @OneToMany(() => Activity, (activity) => activity.user)
  activities: Activity[];

  @OneToMany(() => Provider, (provider) => provider.user)
  providers: Provider[];
}
