import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../user/entity/user.entity';

@Entity({ name: 'file' })
export class File {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  originalname: string;

  @Column()
  mimetype: string;

  @Column()
  path: string;

  @Column()
  size: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @CreateDateColumn()
  createdAt: Date;
}
