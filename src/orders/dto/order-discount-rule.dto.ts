import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DiscountType } from '@prisma/client';

export class OrderDiscountRuleDto {
  @ApiProperty({
    description: 'Discount rule UUID',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  id!: string;

  @ApiProperty({
    description: 'Rule name',
    example: 'Loyalty Discount',
  })
  name!: string;

  @ApiProperty({
    description: 'Minimum transaction count to activate this rule',
    example: 5,
  })
  minTransaction!: number;

  @ApiProperty({
    description: 'Whether this discount can be applied multiple times',
    example: true,
  })
  isRepeatable!: boolean;

  @ApiProperty({
    description: 'Type of discount',
    enum: DiscountType,
    example: DiscountType.PERCENTAGE,
  })
  discountType!: DiscountType;

  @ApiProperty({
    description: 'Discount value',
    example: 10,
  })
  discountValue!: number;

  @ApiPropertyOptional({
    description: 'Maximum discount amount cap',
    example: 50000,
    nullable: true,
  })
  maxDiscountAmount!: number | null;
}
