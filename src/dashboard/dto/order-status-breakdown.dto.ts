import { ApiProperty } from '@nestjs/swagger';

export class OrderStatusCountDto {
  @ApiProperty({ description: 'Number of PENDING orders', example: 12 })
  pending!: number;

  @ApiProperty({ description: 'Number of DONE orders', example: 88 })
  done!: number;
}

export class PaymentStatusCountDto {
  @ApiProperty({ description: 'Number of UNPAID orders', example: 5 })
  unpaid!: number;

  @ApiProperty({ description: 'Number of PAID orders', example: 95 })
  paid!: number;
}

export class OrderStatusBreakdownDto {
  @ApiProperty({ type: () => OrderStatusCountDto })
  orderStatus!: OrderStatusCountDto;

  @ApiProperty({ type: () => PaymentStatusCountDto })
  paymentStatus!: PaymentStatusCountDto;
}
