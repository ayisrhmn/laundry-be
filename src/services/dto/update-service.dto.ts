import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { ServiceUnit } from '@prisma/client';

export class UpdateServiceDto {
  @ApiPropertyOptional({
    description: 'Service name (must be unique)',
    example: 'Wash & Fold',
    maxLength: 100,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({
    description: 'Unit of measurement',
    enum: ServiceUnit,
    example: ServiceUnit.KG,
  })
  @IsEnum(ServiceUnit)
  @IsOptional()
  unit?: ServiceUnit;

  @ApiPropertyOptional({
    description: 'Price in cents/smallest currency unit',
    example: 50000,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  price?: number;
}
