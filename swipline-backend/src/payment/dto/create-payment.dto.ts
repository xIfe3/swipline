import { IsString, IsEmail, IsOptional } from 'class-validator';

export class CreatePaymentDto {
  @IsString()
  trackingId: string;

  @IsEmail()
  @IsOptional()
  email?: string;
}
