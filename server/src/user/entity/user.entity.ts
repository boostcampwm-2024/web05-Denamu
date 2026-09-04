import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

@Entity({
  name: 'user',
})
@Unique('UQ_user_email', ['email'])
@Unique('UQ_user_user_name', ['userName'])
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'email',
    length: 255,
    nullable: false,
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
    name: 'marketing_email_agreed_at',
    type: 'datetime',
    nullable: true,
    default: null,
  })
  marketingEmailAgreedAt: Date | null;

  @Column({
    name: 'inactivity_email_agreed',
    type: 'boolean',
    nullable: false,
    default: false,
  })
  inactivityEmailAgreed: boolean;

  @Column({
    name: 'inactivity_email_agreed_at',
    type: 'datetime',
    nullable: true,
    default: null,
  })
  inactivityEmailAgreedAt: Date | null;

  @Column({
    name: 'notice_email_agreed',
    type: 'boolean',
    nullable: false,
    default: false,
  })
  noticeEmailAgreed: boolean;

  @Column({
    name: 'notice_email_agreed_at',
    type: 'datetime',
    nullable: true,
    default: null,
  })
  noticeEmailAgreedAt: Date | null;

  @Column({
    name: 'profile_image_change_count',
    type: 'int',
    nullable: false,
    default: 0,
  })
  profileImageChangeCount: number;
}
