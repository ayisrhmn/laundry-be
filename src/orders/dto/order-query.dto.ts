import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { OrderStatus, PaymentStatus, DiscountType } from '@prisma/client';

export class OrderQueryDto {
  @ApiPropertyOptional({
    description: 'Search by order number',
    example: 'ORD-20260416',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by customer UUID',
  })
  @IsOptional()
  @IsUUID()
  customerId?: string;

  @ApiPropertyOptional({
    description: 'Filter by order status',
    enum: OrderStatus,
  })
  @IsOptional()
  @IsEnum(OrderStatus)
  orderStatus?: OrderStatus;

  @ApiPropertyOptional({
    description: 'Filter by payment status',
    enum: PaymentStatus,
  })
  @IsOptional()
  @IsEnum(PaymentStatus)
  paymentStatus?: PaymentStatus;

  @ApiPropertyOptional({
    description: 'Filter orders created from this date (ISO 8601)',
    example: '2026-04-01',
  })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional({
    description: 'Filter orders created until this date (ISO 8601)',
    example: '2026-04-30',
  })
  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @ApiPropertyOptional({
    description: 'Filter by discount type',
    enum: DiscountType,
  })
  @IsOptional()
  @IsEnum(DiscountType)
  discountType?: DiscountType;

  @ApiPropertyOptional({
    description: 'Filter orders with or without discount (true = has discount)',
    type: Boolean,
  })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value;
  })
  @IsBoolean()
  hasDiscount?: boolean;

  @ApiPropertyOptional({
    description: 'Filter orders with minimum total price',
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  minAmount?: number;

  @ApiPropertyOptional({
    description: 'Filter orders with maximum total price',
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  maxAmount?: number;

  @ApiPropertyOptional({
    description: 'Page number',
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Items per page',
    minimum: 1,
    maximum: 100,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({
    description:
      'Sort order: newest/oldest by date, newest_amount (termahal) / oldest_amount (termurah) by total price',
    enum: ['newest', 'oldest', 'newest_amount', 'oldest_amount'],
    default: 'newest',
  })
  @IsOptional()
  @IsEnum(['newest', 'oldest', 'newest_amount', 'oldest_amount'])
  sort: 'newest' | 'oldest' | 'newest_amount' | 'oldest_amount' = 'newest';
}
