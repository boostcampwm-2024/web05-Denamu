import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

abstract class UserInformation extends BaseEntity {
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
}

@Entity({
  name: 'admin',
})
export class Admin extends UserInformation {}
