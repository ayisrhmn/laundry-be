import { ApiProperty } from '@nestjs/swagger';

export class DiscountSummaryDto {
  @ApiProperty({
    description: 'Total discount amount given this month',
    example: 185000,
  })
  totalDiscountAmount!: number;

  @ApiProperty({
    description: 'Number of orders that received a discount this month',
    example: 18,
  })
  totalOrdersWithDiscount!: number;

  @ApiProperty({
    description: 'Number of orders with AUTO discount',
    example: 14,
  })
  autoDiscountCount!: number;

  @ApiProperty({
    description: 'Number of orders with MANUAL discount',
    example: 4,
  })
  manualDiscountCount!: number;

  @ApiProperty({
    description: 'Total amount of AUTO discounts',
    example: 140000,
  })
  autoDiscountAmount!: number;

  @ApiProperty({
    description: 'Total amount of MANUAL discounts',
    example: 45000,
  })
  manualDiscountAmount!: number;
}
