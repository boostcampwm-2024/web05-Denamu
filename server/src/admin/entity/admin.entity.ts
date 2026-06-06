import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({
  name: 'admin',
})
export class Admin extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'login_id',
    length: 255,
    nullable: false,
  })
  loginId: string;

  @Column({
    length: 60,
    nullable: false,
  })
  password: string;

  @Column({
    length: 255,
    nullable: false,
  })
  name: string;

  @Column({
    name: 'parent_admin_id',
    type: 'int',
    nullable: true,
  })
  parentAdminId: number | null;

  @ManyToOne(() => Admin, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'parent_admin_id' })
  parent: Admin | null;
}
