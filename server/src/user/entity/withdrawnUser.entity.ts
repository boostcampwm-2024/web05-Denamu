import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity({ name: 'withdrawn_user' })
@Unique('UQ_withdrawn_user_email', ['email'])
export class WithdrawnUser {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    length: 255,
    nullable: false,
  })
  email: string;

  @Column({
    name: 'withdrawn_at',
    type: 'datetime',
    nullable: false,
  })
  withdrawnAt: Date;
}
