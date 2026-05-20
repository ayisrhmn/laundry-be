import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, IsEnum, Min, Max } from 'class-validator';
import { DiscountType } from '@prisma/client';
import { Type } from 'class-transformer';

export class DiscountRuleQueryDto {
  @ApiPropertyOptional({
    description: 'Search discount rules by name (case-insensitive)',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by discount type',
    enum: DiscountType,
  })
  @IsOptional()
  @IsEnum(DiscountType)
  discountType?: DiscountType;

  @ApiPropertyOptional({
    description: 'Page number',
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Items per page',
    minimum: 1,
    maximum: 100,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Sort by creation date (newest or oldest)',
    enum: ['newest', 'oldest'],
    default: 'newest',
  })
  @IsOptional()
  @IsEnum(['newest', 'oldest'])
  sort: 'newest' | 'oldest' = 'newest';
}
