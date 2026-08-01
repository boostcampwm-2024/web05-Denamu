import { Column, Entity, OneToMany, PrimaryGeneratedColumn, Unique } from 'typeorm';

import { Tag } from '@tag/entity/tag.entity';

@Entity({ name: 'category' })
@Unique('UQ_category_name', ['name'])
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 30 })
  name: string;

  @Column({ name: 'display_order' })
  displayOrder: number;

  @OneToMany(() => Tag, (tag) => tag.category)
  tags: Tag[];
}
