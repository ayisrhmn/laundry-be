import { ApiProperty } from '@nestjs/swagger';

export class DashboardSummaryDto {
  @ApiProperty({
    description: 'Total revenue from PAID orders today',
    example: 450000,
  })
  revenueTodayTotal!: number;

  @ApiProperty({
    description: 'Total revenue from PAID orders this month',
    example: 9800000,
  })
  revenueMonthTotal!: number;

  @ApiProperty({ description: 'Number of orders created today', example: 7 })
  orderTodayCount!: number;

  @ApiProperty({
    description: 'Number of orders with PENDING order status',
    example: 12,
  })
  orderPendingCount!: number;

  @ApiProperty({
    description: 'Number of orders with UNPAID payment status',
    example: 5,
  })
  orderUnpaidCount!: number;

  @ApiProperty({
    description: 'Total nominal of UNPAID orders',
    example: 750000,
  })
  orderUnpaidTotal!: number;

  @ApiProperty({
    description: 'Number of customers with at least 1 transaction',
    example: 84,
  })
  totalActiveCustomers!: number;
}
