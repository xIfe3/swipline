import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Stripe from 'stripe';
import { Payment } from '../database/entities/payment.entity';
import { Parcel } from '../database/entities/parcel.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { ParcelStatus } from 'src/common/enums';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private configService: ConfigService,
    @InjectRepository(Payment)
    private paymentsRepository: Repository<Payment>,
    @InjectRepository(Parcel)
    private parcelsRepository: Repository<Parcel>,
  ) {
    const stripeSecretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      throw new Error('STRIPE_SECRET_KEY is not configured');
    }

    this.stripe = new Stripe(stripeSecretKey);
  }

  async createBorderPayment(createPaymentDto: CreatePaymentDto) {
    const parcel = await this.parcelsRepository.findOne({
      where: { trackingId: createPaymentDto.trackingId },
    });

    if (!parcel) {
      throw new NotFoundException('Parcel not found');
    }

    if (parcel.borderFeePaid) {
      throw new BadRequestException('Border fee already paid');
    }

    if (parcel.status !== 'at_border') {
      throw new BadRequestException('Parcel is not at border yet');
    }

    // Create Stripe payment intent
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
      trackingId: parcel.trackingId,
    };
  }

  async handleWebhook(signature: string, payload: Buffer) {
    const webhookSecret = this.configService.get<string>(
      'STRIPE_WEBHOOK_SECRET',
    );

    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET is not configured');
    }

    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        webhookSecret,
      );
    } catch (err) {
      this.logger.error(`Webhook Error: ${err.message}`);
      throw new BadRequestException(`Webhook Error: ${err.message}`);
    }

    // Handle specific event types
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
      case 'payment_intent.created':
        this.logger.log(`Payment intent created: ${event.data.object.id}`);
        break;
      default:
        this.logger.log(`Unhandled event type: ${event.type}`);
    }

    return { received: true, eventType: event.type };
  }

  private async handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
    this.logger.log(`Payment succeeded: ${paymentIntent.id}`);

    const payment = await this.paymentsRepository.findOne({
      where: { paymentId: paymentIntent.id },
      relations: ['parcel'],
    });

    if (payment) {
      // Update payment status
      payment.status = 'completed';
      payment.completedAt = new Date();

      await this.paymentsRepository.save(payment);

      // Update parcel status if it's a border fee payment
      if (payment.type === 'border_fee' && payment.parcel) {
        await this.parcelsRepository.update(payment.parcelId, {
          borderFeePaid: true,
          status: ParcelStatus.BORDER_CLEARED,
        });

        this.logger.log(
          `Parcel ${payment.parcel.trackingId} border fee paid and cleared`,
        );
      }
    }
  }

  private async handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
    this.logger.error(`Payment failed: ${paymentIntent.id}`);

    const payment = await this.paymentsRepository.findOne({
      where: { paymentId: paymentIntent.id },
    });

    if (payment) {
      payment.status = 'failed';
      await this.paymentsRepository.save(payment);
    }
  }

  async getPaymentStatus(paymentId: string) {
    const payment = await this.paymentsRepository.findOne({
      where: { id: paymentId },
      relations: ['parcel'],
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return payment;
  }
}
