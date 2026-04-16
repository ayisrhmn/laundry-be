import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ description: 'Username', example: 'admin' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  username!: string;

  @ApiProperty({ description: 'Password', example: 'secret123' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password!: string;
}
