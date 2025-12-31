import {
  Controller,
  Post,
  Body,
  Headers,
  RawBody,
  Get,
  Param,
} from '@nestjs/common';
import { PaymentsService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('border')
  async createBorderPayment(@Body() createPaymentDto: CreatePaymentDto) {
    const payment =
      await this.paymentsService.createBorderPayment(createPaymentDto);
    return {
      success: true,
      message: 'Payment intent created',
      data: payment,
    };
  }

  @Post('webhook')
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @RawBody() payload: Buffer, // Use @RawBody() decorator
  ) {
    return await this.paymentsService.handleWebhook(signature, payload);
  }

  @Get(':paymentId')
  async getPaymentStatus(@Param('paymentId') paymentId: string) {
    const payment = await this.paymentsService.getPaymentStatus(paymentId);
    return {
      success: true,
      data: payment,
    };
  }
}
