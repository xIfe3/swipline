import { Entity, Column, OneToMany, BeforeInsert } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Parcel } from './parcel.entity';

@Entity('users')
export class User extends BaseEntity {
  @Column({ unique: true })
  email: string;

  @Column()
  fullName: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  address: string;

  @Column({ select: false })
  password: string;

  @Column({ default: 'user' })
  role: 'user' | 'admin' | 'agent';

  @Column({ default: false })
  isVerified: boolean;

  @Column({ nullable: true })
  verificationToken: string;

  @OneToMany(() => Parcel, (parcel) => parcel.sender)
  sentParcels: Parcel[];

  @OneToMany(() => Parcel, (parcel) => parcel.receiver)
  receivedParcels: Parcel[];

  @BeforeInsert()
  emailToLowerCase() {
    this.email = this.email.toLowerCase();
  }
}
