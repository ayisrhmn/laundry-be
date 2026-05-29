import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';

export enum RevenueTrendRange {
  TODAY = 'today',
  SEVEN_DAYS = '7d',
  THIRTY_DAYS = '30d',
  THIS_MONTH = 'this_month',
}

export class RevenueTrendQueryDto {
  @ApiPropertyOptional({
    description: 'Time range for revenue trend data',
    enum: RevenueTrendRange,
    default: RevenueTrendRange.THIRTY_DAYS,
  })
  @IsOptional()
  @IsEnum(RevenueTrendRange)
  range?: RevenueTrendRange = RevenueTrendRange.THIRTY_DAYS;
}

export class TopQueryDto {
  @ApiPropertyOptional({
    description: 'Number of top items to return',
    default: 5,
    minimum: 1,
    maximum: 20,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(20)
  @Type(() => Number)
  limit?: number = 5;
}

export class RecentOrdersQueryDto {
  @ApiPropertyOptional({
    description: 'Number of recent orders to return',
    default: 10,
    minimum: 1,
    maximum: 50,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  @Type(() => Number)
  limit?: number = 10;
}
