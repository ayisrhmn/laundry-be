import { Body, Controller, Get, Post, Request } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import {
  AuthTokenResponseDto,
  AuthUserResponseDto,
} from './dto/auth-response.dto';
import { Public } from '../common/decorators/public.decorator';
import { ResponseMessage } from '../common/decorators/response-message.decorator';
import { ApiResponseOf } from '../common/dto/api-response.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @ResponseMessage('User registered successfully')
  @ApiOperation({ summary: 'Register a new user (Public)' })
  @ApiCreatedResponse({ type: ApiResponseOf(AuthUserResponseDto) })
  @ApiConflictResponse({ description: 'Username already taken.' })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @Post('login')
  @ResponseMessage('Login successful')
  @ApiOperation({ summary: 'Login with username and password (Public)' })
  @ApiOkResponse({ type: ApiResponseOf(AuthTokenResponseDto) })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials.' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Roles(UserRole.ADMIN, UserRole.OPERATOR)
  @Get('me')
  @ApiBearerAuth()
  @ResponseMessage('Profile retrieved successfully')
  @ApiOperation({
    summary: 'Get current authenticated user (Admin and Operator)',
  })
  @ApiOkResponse({ type: ApiResponseOf(AuthUserResponseDto) })
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  me(@Request() req: { user: { id: string } }) {
    return this.authService.me(req.user.id);
  }
}
