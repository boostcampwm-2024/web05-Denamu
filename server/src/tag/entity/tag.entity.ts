import { Feed } from '@feed/entity/feed.entity';

import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'tag' })
export class Tag {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50, unique: true })
  name: string;

  @ManyToMany(() => Feed, (feed) => feed.tags)
  feeds: Feed[];
}
