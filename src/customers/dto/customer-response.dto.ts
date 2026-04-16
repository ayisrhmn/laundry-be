import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CreatedByResponseDto } from '../../common/dto/created-by.dto';

export class CustomerResponseDto {
  @ApiProperty({
    description: 'Customer UUID',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  id!: string;

  @ApiProperty({
    description: 'Full name of the customer',
    example: 'Budi Santoso',
  })
  name!: string;

  @ApiProperty({ description: 'Phone number', example: '+628123456789' })
  phone!: string;

  @ApiPropertyOptional({
    description: 'Customer address',
    example: 'Jl. Merdeka No. 10, Jakarta',
    nullable: true,
  })
  address!: string | null;

  @ApiProperty({ description: 'Total number of transactions', example: 3 })
  transactionCount!: number;

  @ApiPropertyOptional({
    description: 'User who created this record',
    type: () => CreatedByResponseDto,
    nullable: true,
  })
  createdBy!: CreatedByResponseDto | null;

  @ApiProperty({
    description: 'Record creation timestamp',
    example: '2026-04-15T08:00:00.000Z',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2026-04-15T08:00:00.000Z',
  })
  updatedAt!: Date;
}
