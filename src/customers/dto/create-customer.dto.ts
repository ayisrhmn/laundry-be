import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateCustomerDto {
  @ApiProperty({
    description: 'Full name of the customer',
    example: 'Budi Santoso',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  fullName!: string;

  @ApiProperty({
    description: 'Phone number (must be unique)',
    example: '+628123456789',
    maxLength: 20,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  phone!: string;

  @ApiPropertyOptional({
    description: 'Customer address',
    example: 'Jl. Merdeka No. 10, Jakarta',
  })
  @IsOptional()
  @IsString()
  address?: string;
}
