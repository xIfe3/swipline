import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ParcelsService } from './parcels.service';
import { CreateParcelDto } from './dto/create-parcel.dto';
import { UpdateLocationDto } from './dto/update-location.dto';

@Controller('parcels')
export class ParcelsController {
  constructor(private readonly parcelsService: ParcelsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createParcel(@Body() createParcelDto: CreateParcelDto) {
    const parcel = await this.parcelsService.createParcel(createParcelDto);
    return {
      success: true,
      message: 'Parcel created successfully',
      data: {
        trackingId: parcel.trackingId,
        estimatedDelivery: parcel.estimatedDelivery,
        borderFee: parcel.borderFee,
      },
    };
  }

  @Get(':trackingId')
  async getParcel(@Param('trackingId') trackingId: string) {
    const parcel = await this.parcelsService.getParcelByTrackingId(trackingId);
    return {
      success: true,
      data: parcel,
    };
  }

  @Put(':trackingId/location')
  async updateLocation(
    @Param('trackingId') trackingId: string,
    @Body() updateLocationDto: UpdateLocationDto,
  ) {
    const parcel = await this.parcelsService.updateParcelLocation(
      trackingId,
      updateLocationDto,
    );
    return {
      success: true,
      message: 'Location updated successfully',
      data: parcel,
    };
  }

  @Get(':trackingId/tracking')
  async getTrackingHistory(@Param('trackingId') trackingId: string) {
    const parcel = await this.parcelsService.getParcelByTrackingId(trackingId);
    return {
      success: true,
      data: {
        trackingId: parcel.trackingId,
        currentLocation: parcel.currentLocation,
        status: parcel.status,
        history: parcel.trackingHistory,
      },
    };
  }
}
