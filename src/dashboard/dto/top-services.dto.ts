import { ApiProperty } from '@nestjs/swagger';
import { ServiceUnit } from '@prisma/client';

export class TopServiceItemDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  serviceId!: string;

  @ApiProperty({ example: 'Cuci Kering' })
  serviceName!: string;

  @ApiProperty({ enum: ServiceUnit, example: ServiceUnit.KG })
  unit!: ServiceUnit;

  @ApiProperty({
    description: 'Number of order items for this service',
    example: 42,
  })
  orderCount!: number;

  @ApiProperty({
    description: 'Total revenue from this service',
    example: 1680000,
  })
  totalRevenue!: number;
}
