import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Parcel } from 'src/database/entities/parcel.entity';
import { TrackingHistory } from 'src/database/entities/tracking-history.entity';
import { CreateParcelDto } from './dtos/create-parcel.dto';
import { NotificationsService } from '../notifications/email.service';
import { EmailTemplate } from '../../common/templates/email.template';

@Injectable()
export class ParcelsService {
  constructor(
    @InjectRepository(Parcel)
    private parcelsRepository: Repository<Parcel>,
    @InjectRepository(TrackingHistory)
    private trackingRepository: Repository<TrackingHistory>,
    private notificationsService: NotificationsService,
  ) {}

  async createParcel(createParcelDto: CreateParcelDto): Promise<Parcel> {
    // Calculate shipping cost
    const shippingCost = this.calculateShippingCost(
      createParcelDto.weight,
      createParcelDto.destinationCountry,
    );

    // Calculate border fee
    const borderFee = this.calculateBorderFee(
      createParcelDto.destinationCountry,
    );

    // Create parcel
    const parcel = this.parcelsRepository.create({
      ...createParcelDto,
      shippingCost,
      borderFee,
      status: 'pending',
      currentLocation: 'Warehouse - Origin',
    });

    const savedParcel = await this.parcelsRepository.save(parcel);

    // Create initial tracking history
    await this.createTrackingHistory(savedParcel.id, {
      status: 'pending',
      location: 'Warehouse - Origin',
      description: 'Parcel registered in system',
    });

    // Send tracking ID email
    await this.notificationsService.sendEmail({
      to: savedParcel.senderEmail,
      subject: 'Your Consignment Tracking Details',
      html: EmailTemplate.trackingCreated(savedParcel),
    });

    return savedParcel;
  }

  async getParcelByTrackingId(trackingId: string): Promise<Parcel> {
    const parcel = await this.parcelsRepository.findOne({
      where: { trackingId },
      relations: ['trackingHistory', 'payments'],
      order: {
        trackingHistory: { createdAt: 'DESC' },
      },
    });

    if (!parcel) {
      throw new NotFoundException(
        `Parcel with tracking ID ${trackingId} not found`,
      );
    }

    return parcel;
  }

  async updateParcelLocation(
    parcelId: string,
    location: string,
    status: string,
    coordinates?: { lat: number; lng: number },
    description?: string,
  ) {
    const parcel = await this.parcelsRepository.findOneBy({ id: parcelId });

    if (!parcel) {
      throw new NotFoundException('Parcel not found');
    }

    // Update parcel
    parcel.currentLocation = location;
    parcel.status = status;
    if (coordinates) {
      parcel.coordinates = `POINT(${coordinates.lng} ${coordinates.lat})`;
    }

    await this.parcelsRepository.save(parcel);

    // Create tracking history entry
    await this.createTrackingHistory(parcelId, {
      status,
      location,
      coordinates: coordinates
        ? `POINT(${coordinates.lng} ${coordinates.lat})`
        : null,
      description,
    });

    // Send notification if status changed significantly
    if (
      ['at_border', 'border_cleared', 'out_for_delivery', 'delivered'].includes(
        status,
      )
    ) {
      await this.notificationsService.sendStatusUpdate(parcel, status);
    }

    return parcel;
  }

  private async createTrackingHistory(
    parcelId: string,
    data: Partial<TrackingHistory>,
  ): Promise<TrackingHistory> {
    const history = this.trackingRepository.create({
      parcelId,
      ...data,
    });
    return await this.trackingRepository.save(history);
  }

  private calculateShippingCost(weight: number, destination: string): number {
    // Simplified calculation - in production, integrate with shipping API
    const baseCost = 10;
    const weightCost = weight * 2;
    const destinationMultiplier = this.getCountryMultiplier(destination);
    return (baseCost + weightCost) * destinationMultiplier;
  }

  private calculateBorderFee(destination: string): number {
    // Border fee calculation based on destination country
    const fees = {
      US: 25,
      UK: 30,
      CA: 20,
      AU: 35,
      EU: 15,
    };
    return fees[destination] || 20;
  }

  private getCountryMultiplier(country: string): number {
    const multipliers = {
      US: 1.2,
      UK: 1.3,
      CA: 1.1,
      AU: 1.5,
      EU: 1.0,
    };
    return multipliers[country] || 1.0;
  }
}
