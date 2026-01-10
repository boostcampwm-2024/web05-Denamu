import { User } from '@user/entity/user.entity';

import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'file' })
export class File {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'original_name',
  })
  originalName: string;

  @Column()
  mimetype: string;

  @Column()
  path: string;

  @Column()
  size: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt: Date;
}
