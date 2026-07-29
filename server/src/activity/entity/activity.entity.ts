import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

import { User } from '@user/entity/user.entity';

@Entity({
  name: 'activity',
})
@Unique('UQ_activity_user_id_activity_date', ['user', 'activityDate'])
export class Activity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'activity_date',
    type: 'date',
    nullable: false,
    transformer: {
      to: (value: Date) => value,
      from: (value: string | Date) => {
        if (typeof value === 'string') {
          return new Date(value);
        }
        return value;
      },
    },
  })
  activityDate: Date;

  @Column({
    name: 'view_count',
    type: 'int',
    nullable: false,
  })
  viewCount: number;

  @ManyToOne(() => User, (user) => user.activities)
  @JoinColumn({ name: 'user_id', foreignKeyConstraintName: 'FK_activity_user_id' })
  user: User;
}
