import { Activity } from '@activity/entity/activity.entity';

import { Provider } from '@user/entity/provider.entity';

import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

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

  @OneToMany(() => Activity, (activity) => activity.user)
  activities: Activity[];

  @OneToMany(() => Provider, (provider) => provider.user)
  providers: Provider[];
}
