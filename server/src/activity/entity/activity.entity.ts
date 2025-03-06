import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../user/entity/user.entity';

@Entity({
  name: 'activity',
})
export class Activity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'activity_date',
    type: 'date',
    nullable: false,
  })
  activityDate: string;

  @Column({
    name: 'view_count',
    type: 'int',
    nullable: false,
  })
  viewCount: number;

  @ManyToOne(() => User, (user) => user.activities)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
