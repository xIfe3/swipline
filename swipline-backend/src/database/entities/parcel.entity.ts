import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  BeforeInsert,
  JoinColumn,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';
import { TrackingHistory } from './tracking-history.entity';
import { Payment } from './payment.entity';
import { ParcelStatus } from 'src/common/enums';

@Entity('parcels')
export class Parcel extends BaseEntity {
  @Column({ unique: true })
  trackingId: string;

  @ManyToOne(() => User, (user) => user.sentParcels)
  @JoinColumn({ name: 'senderId' })
  sender: User;

  @Column()
  senderEmail: string;

  @Column()
  senderPhone: string;

  @Column()
  recipientName: string;

  @ManyToOne(() => User, (user) => user.receivedParcels)
  @JoinColumn({ name: 'receiverId' })
  receiver: User;

  @Column()
  recipientEmail: string;

  @Column()
  recipientPhone: string;

  @Column()
  recipientAddress: string;

  @Column()
  destinationCountry: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  weight: number;

  @Column({ type: 'jsonb' })
  dimensions: { length: number; width: number; height: number; unit: string };

  @Column({ type: 'jsonb', nullable: true })
  contents: Array<{
    description: string;
    quantity: number;
    value: number;
  }>;

  @Column({ type: 'enum', enum: ParcelStatus, default: ParcelStatus.PENDING })
  status: ParcelStatus;

  @Column({ nullable: true })
  currentLocation: string;

  @Column({ type: 'point', spatialFeatureType: 'Point', nullable: true })
  coordinates: { lat: number; lan: number };

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  shippingCost: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  borderFee: number;

  @Column({ default: false })
  borderFeePaid: boolean;

  @Column({ type: 'timestamp', nullable: true })
  estimatedDelivery: Date;

  @Column({ type: 'timestamp', nullable: true })
  actualDelivery: Date;

  @OneToMany(() => TrackingHistory, (history) => history.parcel)
  trackingHistory: TrackingHistory[];

  @OneToMany(() => Payment, (payment) => payment.parcel)
  payments: Payment[];

  @BeforeInsert()
  generateTrackingId() {
    const prefix = 'SWP';
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.trackingId = `${prefix}${year}${month}${random}`;
  }

  @BeforeInsert()
  setSenderEmail() {
    if (this.sender && !this.senderEmail) {
      this.senderEmail = this.sender.email;
    }
  }
}
