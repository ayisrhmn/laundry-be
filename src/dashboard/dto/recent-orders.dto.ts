import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus, PaymentStatus } from '@prisma/client';

export class RecentOrderItemDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id!: string;

  @ApiProperty({ example: 'ORD-20260529-001' })
  orderNumber!: string;

  @ApiProperty({ example: 'Budi Santoso' })
  customerName!: string;

  @ApiProperty({ example: 75000 })
  totalPrice!: number;

  @ApiProperty({ enum: OrderStatus, example: OrderStatus.PENDING })
  orderStatus!: OrderStatus;

  @ApiProperty({ enum: PaymentStatus, example: PaymentStatus.UNPAID })
  paymentStatus!: PaymentStatus;

  @ApiProperty({ example: '2026-05-29T08:00:00.000Z' })
  createdAt!: Date;
}
