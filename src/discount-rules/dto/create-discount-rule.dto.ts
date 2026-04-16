import {
  IsString,
  IsInt,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  Min,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DiscountType } from '@prisma/client';

export class CreateDiscountRuleDto {
  @ApiProperty({ example: 'Loyalty Discount 10 Transactions' })
  @IsString()
  @MaxLength(100)
  name!: string;

  @ApiProperty({ example: 10 })
  @IsInt()
  @Min(1)
  minTransaction!: number;

  @ApiProperty({ example: true })
  @IsBoolean()
  isRepeatable!: boolean;

  @ApiProperty({ example: DiscountType.PERCENTAGE, enum: DiscountType })
  @IsEnum(DiscountType)
  discountType!: DiscountType;

  @ApiProperty({ example: 10 })
  @IsNumber()
  @Min(0)
  discountValue!: number;

  @ApiPropertyOptional({ example: 50000 })
  @IsOptional()
  @IsInt()
  @Min(0)
  maxDiscountAmount?: number;
}
