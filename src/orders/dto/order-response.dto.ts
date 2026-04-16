import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  OrderStatus,
  PaymentStatus,
  DiscountType,
  DiscountSource,
} from '@prisma/client';
import { OrderItemResponseDto } from './order-item-response.dto';

export class OrderResponseDto {
  @ApiProperty({
    description: 'Order UUID',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  id!: string;

  @ApiProperty({
    description: 'Order number (auto-generated)',
    example: 'ORD-20260416-001',
  })
  orderNumber!: string;

  @ApiProperty({
    description: 'Customer UUID',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  customerId!: string;

  @ApiProperty({
    description: 'Order status',
    enum: OrderStatus,
    example: OrderStatus.PENDING,
  })
  orderStatus!: OrderStatus;

  @ApiProperty({
    description: 'Payment status',
    enum: PaymentStatus,
    example: PaymentStatus.UNPAID,
  })
  paymentStatus!: PaymentStatus;

  @ApiProperty({
    description: 'Subtotal before discount (in cents)',
    example: 250000,
  })
  subtotal!: number;

  @ApiPropertyOptional({
    description: 'Discount type applied',
    enum: DiscountType,
    example: DiscountType.PERCENTAGE,
    nullable: true,
  })
  discountType!: DiscountType | null;

  @ApiProperty({
    description: 'Discount value (percentage or fixed amount)',
    example: 10,
  })
  discountValue!: number;

  @ApiProperty({
    description: 'Actual discount amount deducted (in cents)',
    example: 25000,
  })
  discountAmount!: number;

  @ApiPropertyOptional({
    description: 'Source of discount (AUTO or MANUAL)',
    enum: DiscountSource,
    example: DiscountSource.AUTO,
    nullable: true,
  })
  discountSource!: DiscountSource | null;

  @ApiProperty({
    description: 'Total price after discount (in cents)',
    example: 225000,
  })
  totalPrice!: number;

  @ApiProperty({
    description: 'Order items',
    type: [OrderItemResponseDto],
  })
  items!: OrderItemResponseDto[];

  @ApiPropertyOptional({
    description: 'Soft delete timestamp (null if active)',
    example: null,
    nullable: true,
  })
  deletedAt!: Date | null;

  @ApiProperty({
    description: 'Record creation timestamp',
    example: '2026-04-16T10:30:00Z',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'Record last update timestamp',
    example: '2026-04-16T10:30:00Z',
  })
  updatedAt!: Date;
}
