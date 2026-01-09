import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { Feed } from '@feed/entity/feed.entity';

@Entity({ name: 'tag' })
export class Tag {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50, unique: true })
  name: string;

  @ManyToMany(() => Feed, (feed) => feed.tags)
  feeds: Feed[];
}
