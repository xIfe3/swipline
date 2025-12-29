import { Entity, Column, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Parcel } from './parcel.entity';
import { User } from './user.entity';

@Entity('payments')
export class Payment extends BaseEntity {
  @ManyToOne(() => Parcel, (parcel) => parcel.payments)
  parcel: Parcel;

  @Column()
  parcelId: string;

  @ManyToOne(() => User)
  user: User;

  @Column()
  userId: string;

  @Column({ unique: true })
  paymentId: string; // Stripe payment intent ID

  @Column()
  type: 'border_fee' | 'shipping_fee' | 'tax';

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column()
  currency: string;

  @Column({ default: 'pending' })
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  paymentMethod: {
    type: string;
    last4?: string;
    brand?: string;
  };

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;
}
