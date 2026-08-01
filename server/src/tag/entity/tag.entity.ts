import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

import { Feed } from '@feed/entity/feed.entity';
import { Category } from '@tag/entity/category.entity';

@Entity({ name: 'tag' })
@Unique('UQ_tag_name', ['name'])
export class Tag {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50 })
  name: string;

  @ManyToOne(() => Category, (category) => category.tags, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({
    name: 'category_id',
    foreignKeyConstraintName: 'FK_tag_category',
  })
  category: Category;

  @ManyToMany(() => Feed, (feed) => feed.tags)
  feeds: Feed[];
}
