import { ApiProperty } from '@nestjs/swagger';
import { ServiceUnit } from '@prisma/client';

export class OrderItemResponseDto {
  @ApiProperty({
    description: 'Order Item UUID',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  id!: string;

  @ApiProperty({
    description: 'Service UUID',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  serviceId!: string;

  @ApiProperty({
    description: 'Service name',
    example: 'Wash & Fold',
  })
  serviceName!: string;

  @ApiProperty({
    description: 'Unit of measurement',
    enum: ServiceUnit,
    example: ServiceUnit.KG,
  })
  serviceUnit!: ServiceUnit;

  @ApiProperty({
    description: 'Quantity',
    example: 2.5,
  })
  qty!: number;

  @ApiProperty({
    description: 'Price per unit at time of order (in cents)',
    example: 50000,
  })
  price!: number;

  @ApiProperty({
    description: 'Subtotal for this item (qty * price)',
    example: 125000,
  })
  subtotal!: number;

  @ApiProperty({
    description: 'Record creation timestamp',
    example: '2026-04-16T10:30:00Z',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'Record last update timestamp',
    example: '2026-04-16T10:30:00Z',
  })
  updatedAt!: Date;
}
