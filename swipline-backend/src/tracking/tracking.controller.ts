import { Controller, Get, Param } from '@nestjs/common';
import { ParcelsService } from '../parcels/parcels.service';

@Controller('track')
export class TrackingController {
  constructor(private readonly parcelsService: ParcelsService) {}

  @Get(':trackingId')
  async trackParcel(@Param('trackingId') trackingId: string) {
    const parcel = await this.parcelsService.getParcelByTrackingId(trackingId);

    // Only return public information
    return {
      success: true,
      data: {
        trackingId: parcel.trackingId,
        status: parcel.status,
        currentLocation: parcel.currentLocation,
        estimatedDelivery: parcel.estimatedDelivery,
        borderFee: parcel.borderFee,
        borderFeePaid: parcel.borderFeePaid,
        history: parcel.trackingHistory.map((history) => ({
          status: history.status,
          location: history.location,
          description: history.description,
          timestamp: history.createdAt,
        })),
      },
    };
  }
}
