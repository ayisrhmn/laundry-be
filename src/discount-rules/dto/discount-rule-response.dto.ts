import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CreatedByResponseDto } from '../../common/dto/created-by.dto';
import { DiscountType } from '@prisma/client';

export class DiscountRuleResponseDto {
  @ApiProperty({
    description: 'Discount rule unique identifier',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id!: string;

  @ApiProperty({
    description: 'Unique name for the discount rule',
    example: 'Loyalty Discount 10 Transactions',
  })
  name!: string;

  @ApiProperty({
    description: 'Minimum transaction count to activate this rule',
    example: 10,
  })
  minTransaction!: number;

  @ApiProperty({
    description:
      'Whether this discount can be applied multiple times or only once',
    example: true,
  })
  isRepeatable!: boolean;

  @ApiProperty({
    description: 'Type of discount calculation',
    enum: DiscountType,
    example: DiscountType.PERCENTAGE,
  })
  discountType!: DiscountType;

  @ApiProperty({
    description: 'Discount value (for PERCENTAGE: 0-100, for FIXED: amount)',
    example: 10,
  })
  discountValue!: number;

  @ApiProperty({
    description: 'Maximum discount amount cap, null if no limit',
    example: 50000,
    nullable: true,
  })
  maxDiscountAmount!: number | null;

  @ApiPropertyOptional({
    description: 'User who created this record',
    type: () => CreatedByResponseDto,
    nullable: true,
  })
  createdBy!: CreatedByResponseDto | null;

  @ApiProperty({
    description: 'Timestamp when rule was created',
    example: '2026-04-16T10:30:00.000Z',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'Timestamp when rule was last updated',
    example: '2026-04-16T10:30:00.000Z',
  })
  updatedAt!: Date;
}
