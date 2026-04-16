import { ApiProperty } from '@nestjs/swagger';
import { ServiceUnit } from '@prisma/client';

export class ServiceResponseDto {
  @ApiProperty({
    description: 'Service UUID',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  id!: string;

  @ApiProperty({
    description: 'Service name',
    example: 'Wash & Fold',
  })
  name!: string;

  @ApiProperty({
    description: 'Unit of measurement',
    enum: ServiceUnit,
    example: ServiceUnit.KG,
  })
  unit!: ServiceUnit;

  @ApiProperty({
    description: 'Price in cents/smallest currency unit',
    example: 50000,
  })
  price!: number;

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
