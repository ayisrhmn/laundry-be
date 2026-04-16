import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { DiscountType, PaymentStatus } from '@prisma/client';
import { CreateOrderItemDto } from './create-order-item.dto';

export class CreateOrderDto {
  @ApiProperty({
    description: 'Customer UUID',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @IsUUID()
  @IsNotEmpty()
  customerId!: string;

  @ApiProperty({
    description: 'Array of items in the order',
    type: [CreateOrderItemDto],
  })
  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items!: CreateOrderItemDto[];

  @ApiPropertyOptional({
    description: 'Payment status when creating order (UNPAID or PAID)',
    enum: PaymentStatus,
    example: PaymentStatus.UNPAID,
  })
  @IsEnum(PaymentStatus)
  @IsOptional()
  paymentStatus?: PaymentStatus;

  @ApiPropertyOptional({
    description:
      'Manual discount type (FIXED or PERCENTAGE) - overrides auto-discount',
    enum: DiscountType,
    example: DiscountType.FIXED,
  })
  @IsEnum(DiscountType)
  @IsOptional()
  manualDiscountType?: DiscountType;

  @ApiPropertyOptional({
    description:
      'Manual discount value (amount in cents for FIXED, or percentage for PERCENTAGE)',
    example: 5000,
  })
  @IsOptional()
  @Min(0)
  manualDiscountValue?: number;
}
