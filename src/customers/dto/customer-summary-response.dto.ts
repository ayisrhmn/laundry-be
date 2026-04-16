import { ApiProperty } from '@nestjs/swagger';

export class CustomerSummaryResponseDto {
  @ApiProperty({ description: 'Total number of orders', example: 10 })
  totalOrders!: number;

  @ApiProperty({ description: 'Number of completed orders', example: 7 })
  completedOrders!: number;

  @ApiProperty({ description: 'Number of pending orders', example: 3 })
  pendingOrders!: number;

  @ApiProperty({ description: 'Number of paid orders', example: 8 })
  paidOrders!: number;

  @ApiProperty({ description: 'Number of unpaid orders', example: 2 })
  unpaidOrders!: number;

  @ApiProperty({
    description: 'Total amount spent on paid orders',
    example: 350000,
  })
  totalSpent!: number;
}
