import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

export class CreatedByResponseDto {
  @ApiProperty({
    description: 'User UUID',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  id!: string;

  @ApiProperty({
    description: 'Username',
    example: 'admin01',
  })
  username!: string;

  @ApiProperty({
    description: 'Full name',
    example: 'Admin User',
  })
  fullName!: string;

  @ApiProperty({
    description: 'User role',
    enum: UserRole,
    example: UserRole.OPERATOR,
  })
  role!: UserRole;
}
