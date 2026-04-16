import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  DiscountSource,
  DiscountType,
  OrderStatus,
  PaymentStatus,
} from '@prisma/client';

export class OrderItemDetailDto {
  @ApiProperty() id!: string;
  @ApiProperty() serviceId!: string;
  @ApiProperty() qty!: number;
  @ApiProperty() price!: number;
  @ApiProperty() subtotal!: number;
  @ApiProperty() createdAt!: Date;
  @ApiProperty() updatedAt!: Date;
}

export class CustomerOrderResponseDto {
  @ApiProperty() id!: string;

  @ApiProperty({ enum: OrderStatus })
  orderStatus!: OrderStatus;

  @ApiProperty({ enum: PaymentStatus })
  paymentStatus!: PaymentStatus;

  @ApiProperty() subtotal!: number;

  @ApiPropertyOptional({ enum: DiscountType, nullable: true })
  discountType!: DiscountType | null;

  @ApiProperty() discountValue!: number;
  @ApiProperty() discountAmount!: number;

  @ApiPropertyOptional({ enum: DiscountSource, nullable: true })
  discountSource!: DiscountSource | null;

  @ApiProperty() totalPrice!: number;

  @ApiProperty({ type: [OrderItemDetailDto] })
  items!: OrderItemDetailDto[];

  @ApiProperty() createdAt!: Date;
  @ApiProperty() updatedAt!: Date;
}
