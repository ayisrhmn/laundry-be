import { ApiProperty } from '@nestjs/swagger';

export class RevenueTrendItemDto {
  @ApiProperty({
    description: 'Date in YYYY-MM-DD format',
    example: '2026-05-01',
  })
  date!: string;

  @ApiProperty({
    description: 'Total revenue from PAID orders on this date',
    example: 320000,
  })
  revenue!: number;
}
