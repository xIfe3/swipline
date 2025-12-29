import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ParcelsModule } from './parcels/parcels.module';
import { PaymentModule } from './payment/payment.module';
import { TrackingModule } from './tracking/tracking.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [ParcelsModule, PaymentModule, TrackingModule, NotificationsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
