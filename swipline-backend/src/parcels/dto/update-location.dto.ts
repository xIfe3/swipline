import {
  IsString,
  IsOptional,
  IsNumber,
  Min,
  Max,
  IsObject,
} from 'class-validator';

export class CoordinatesDto {
  @IsNumber()
  @Min(-90)
  @Max(90)
  lat: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  lng: number;
}

export class UpdateLocationDto {
  @IsString()
  location: string;

  @IsString()
  status: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsObject()
  coordinates?: CoordinatesDto;
}
