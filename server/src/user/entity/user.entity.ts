import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Activity } from '../../activity/entity/activity.entity';

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
    nullable: false,
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

  @OneToMany(() => Activity, (activity) => activity.user)
  activities: Activity[];
}
