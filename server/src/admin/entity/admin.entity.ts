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
    length: 60,
    nullable: false,
  })
  password: string;

  @Column({
    length: 255,
    nullable: false,
    unique: true,
  })
  name: string;

  @Column({
    length: 255,
    nullable: false,
    unique: true,
  })
  email: string;

  @Column({
    name: 'email_notification',
    type: 'boolean',
    nullable: false,
    default: true,
  })
  emailNotification: boolean;

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
