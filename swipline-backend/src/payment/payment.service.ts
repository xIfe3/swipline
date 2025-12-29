import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Stripe from 'stripe';
import { Payment } from '../../database/entities/payment.entity';
import { Parcel } from '../../database/entities/parcel.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;

  constructor(
    private configService: ConfigService,
    @InjectRepository(Payment)
    private paymentsRepository: Repository<Payment>,
    @InjectRepository(Parcel)
    private parcelsRepository: Repository<Parcel>,
  ) {
    this.stripe = new Stripe(this.configService.get('stripe.secretKey'), {
      apiVersion: '2023-10-16',
    });
  }

  async createBorderPayment(createPaymentDto: CreatePaymentDto) {
    const parcel = await this.parcelsRepository.findOne({
      where: { trackingId: createPaymentDto.trackingId },
    });

    if (!parcel) {
      throw new BadRequestException('Parcel not found');
    }

    if (parcel.borderFeePaid) {
      throw new BadRequestException('Border fee already paid');
    }

    // Create payment intent
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Math.round(parcel.borderFee * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        parcelId: parcel.id,
        trackingId: parcel.trackingId,
        type: 'border_fee',
      },
      description: `Border crossing fee for ${parcel.trackingId}`,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Create payment record
    const payment = this.paymentsRepository.create({
      parcelId: parcel.id,
      paymentId: paymentIntent.id,
      type: 'border_fee',
      amount: parcel.borderFee,
      currency: 'usd',
      status: 'pending',
    });

    await this.paymentsRepository.save(payment);

    return {
      clientSecret: paymentIntent.client_secret,
      paymentId: payment.id,
      amount: parcel.borderFee,
      currency: 'usd',
    };
  }

  async handleWebhook(signature: string, payload: Buffer) {
    const webhookSecret = this.configService.get('stripe.webhookSecret');

    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        webhookSecret,
      );
    } catch (err) {
      throw new BadRequestException(`Webhook Error: ${err.message}`);
    }

    switch (event.type) {
      case 'payment_intent.succeeded':
        await this.handlePaymentSuccess(
          event.data.object as Stripe.PaymentIntent,
        );
        break;
      case 'payment_intent.payment_failed':
        await this.handlePaymentFailure(
          event.data.object as Stripe.PaymentIntent,
        );
        break;
    }

    return { received: true };
  }

  private async handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
    const payment = await this.paymentsRepository.findOne({
      where: { paymentId: paymentIntent.id },
      relations: ['parcel'],
    });

    if (payment) {
      payment.status = 'completed';
      payment.completedAt = new Date();
      payment.paymentMethod = {
        type: paymentIntent.payment_method_types[0],
        last4:
          paymentIntent.charges.data[0]?.payment_method_details?.card?.last4,
        brand:
          paymentIntent.charges.data[0]?.payment_method_details?.card?.brand,
      };

      await this.paymentsRepository.save(payment);

      // Update parcel border fee status
      if (payment.type === 'border_fee') {
        await this.parcelsRepository.update(payment.parcelId, {
          borderFeePaid: true,
          status: 'border_cleared',
        });

        // Add tracking history
        // You'll need to inject tracking service here
      }
    }
  }

  private async handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
    const payment = await this.paymentsRepository.findOne({
      where: { paymentId: paymentIntent.id },
    });

    if (payment) {
      payment.status = 'failed';
      await this.paymentsRepository.save(payment);
    }
  }
}
