import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { ServiceUnit } from '@prisma/client';

export class CreateServiceDto {
  @ApiProperty({
    description: 'Service name (must be unique)',
    example: 'Wash & Fold',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @ApiProperty({
    description: 'Unit of measurement',
    enum: ServiceUnit,
    example: ServiceUnit.KG,
  })
  @IsEnum(ServiceUnit)
  @IsNotEmpty()
  unit!: ServiceUnit;

  @ApiProperty({
    description: 'Price in cents/smallest currency unit',
    example: 50000,
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  price!: number;
}
