import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { Tag } from '@tag/entity/tag.entity';

@Entity({ name: 'category' })
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 30, unique: true })
  name: string;

  @Column({ name: 'display_order' })
  displayOrder: number;

  @OneToMany(() => Tag, (tag) => tag.category)
  tags: Tag[];
}
