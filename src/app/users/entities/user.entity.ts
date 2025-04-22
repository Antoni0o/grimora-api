import { hashSync } from 'bcrypt';
import { Entity, PrimaryGeneratedColumn, Column, BeforeUpdate, BeforeInsert } from 'typeorm';
import { v4 as uuid } from 'uuid';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column()
  name!: string;

  @Column({ default: false })
  isVerified?: boolean;

  @Column({ nullable: true })
  verificationToken?: string;

  @Column({ nullable: true })
  refreshToken?: string;

  constructor(user?: Partial<User>) {
    this.id = user?.id ?? uuid();
    this.name = user?.name ?? '';
    this.email = user?.email ?? '';
    this.password = user?.password ?? '';
    this.isVerified = this.isVerified ?? false;
  }

  @BeforeUpdate()
  hashPasswordBeforeUpdate() {
    this.password = hashSync(this.password, 8);
  }

  @BeforeInsert()
  hashPasswordBeforeInsert() {
    this.password = hashSync(this.password, 8);
  }
}
