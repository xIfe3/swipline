import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Parcel } from './parcel.entity';

@Entity('tracking_history')
export class TrackingHistory extends BaseEntity {
  @ManyToOne(() => Parcel, (parcel) => parcel.trackingHistory)
  @JoinColumn({ name: 'parcel_id' })
  parcel: Parcel;

  @Column()
  status: string;

  @Column()
  location: string;

  @Column({ type: 'jsonb', nullable: true })
  coordinates: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  estimatedNextUpdate: Date;
}
