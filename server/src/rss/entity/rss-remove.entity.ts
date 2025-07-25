import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { RssAccept } from './rss.entity';

@Entity({
  name: 'rss_remove',
})
export class RssRemoveRequest extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => RssAccept, {
    nullable: false,
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'blog_id',
  })
  blog: RssAccept;

  @CreateDateColumn({
    name: 'request_date',
  })
  date: Date;

  @Column({
    type: 'text',
  })
  reason: string;
}
