import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  DiscountSource,
  DiscountType,
  OrderStatus,
  PaymentStatus,
} from '@prisma/client';
import { CreatedByResponseDto } from '../../common/dto/created-by.dto';
import { OrderDiscountRuleDto } from '../../orders/dto/order-discount-rule.dto';

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

  @ApiPropertyOptional({
    description: 'Discount rule applied (only when discountSource is AUTO)',
    type: () => OrderDiscountRuleDto,
    nullable: true,
  })
  discountRule!: OrderDiscountRuleDto | null;

  @ApiPropertyOptional({
    description: 'User who created this order',
    type: () => CreatedByResponseDto,
    nullable: true,
  })
  createdBy!: CreatedByResponseDto | null;

  @ApiProperty({ type: [OrderItemDetailDto] })
  items!: OrderItemDetailDto[];

  @ApiProperty() createdAt!: Date;
  @ApiProperty() updatedAt!: Date;
}
