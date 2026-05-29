import { ApiProperty } from '@nestjs/swagger';

export class TopCustomerItemDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  customerId!: string;

  @ApiProperty({ example: 'Budi Santoso' })
  customerName!: string;

  @ApiProperty({ example: '081234567890' })
  phone!: string;

  @ApiProperty({
    description: 'Total number of completed (PAID) transactions',
    example: 15,
  })
  transactionCount!: number;

  @ApiProperty({
    description: 'Total spending from PAID orders',
    example: 2450000,
  })
  totalSpending!: number;
}
