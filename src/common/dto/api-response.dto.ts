import { ApiProperty } from '@nestjs/swagger';
import { Type } from '@nestjs/common';

export class ApiPaginationMeta {
  @ApiProperty({ example: 100 })
  total!: number;

  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 10 })
  limit!: number;

  @ApiProperty({ example: 10 })
  totalPages!: number;
}

export function ApiResponseOf<T>(DataClass: Type<T>) {
  class ApiResponseWrapper {
    @ApiProperty({ example: 'Success' })
    message!: string;

    @ApiProperty({ example: 200 })
    status!: number;

    @ApiProperty({ type: () => DataClass })
    data!: T;
  }
  Object.defineProperty(ApiResponseWrapper, 'name', {
    value: `ApiResponseOf${DataClass.name}`,
  });
  return ApiResponseWrapper;
}

export function ApiArrayResponseOf<T>(DataClass: Type<T>) {
  class ApiResponseWrapper {
    @ApiProperty({ example: 'Success' })
    message!: string;

    @ApiProperty({ example: 200 })
    status!: number;

    @ApiProperty({ type: () => [DataClass] })
    data!: T[];
  }
  Object.defineProperty(ApiResponseWrapper, 'name', {
    value: `ApiArrayResponseOf${DataClass.name}`,
  });
  return ApiResponseWrapper;
}

export function PaginatedApiResponseOf<T>(DataClass: Type<T>) {
  class ApiResponseWrapper {
    @ApiProperty({ example: 'Success' })
    message!: string;

    @ApiProperty({ example: 200 })
    status!: number;

    @ApiProperty({ type: () => [DataClass] })
    data!: T[];

    @ApiProperty({ type: () => ApiPaginationMeta })
    pagination!: ApiPaginationMeta;
  }
  Object.defineProperty(ApiResponseWrapper, 'name', {
    value: `PaginatedApiResponseOf${DataClass.name}`,
  });
  return ApiResponseWrapper;
}
