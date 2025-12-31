import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsArray,
  ValidateNested,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

class ContentItemDto {
  @IsString()
  description: string;

  @IsNumber()
  quantity: number;

  @IsNumber()
  value: number;
}

export class CreateParcelDto {
  @IsString()
  @IsNotEmpty()
  senderName: string;

  @IsEmail()
  senderEmail: string;

  @IsString()
  senderPhone: string;

  @IsString()
  @IsNotEmpty()
  recipientName: string;

  @IsEmail()
  recipientEmail: string;

  @IsString()
  recipientPhone: string;

  @IsString()
  @IsNotEmpty()
  recipientAddress: string;

  @IsString()
  destinationCountry: string;

  @IsNumber()
  @Min(0.1)
  @Max(100)
  weight: number;

  dimensions: {
    length: number;
    width: number;
    height: number;
    unit: 'cm' | 'in';
  };

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ContentItemDto)
  contents: ContentItemDto[];
}
