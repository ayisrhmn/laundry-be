import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserQueryDto } from './dto/user-query.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { ResponseMessage } from '../common/decorators/response-message.decorator';
import {
  ApiResponseOf,
  PaginatedApiResponseOf,
} from '../common/dto/api-response.dto';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ResponseMessage('Users retrieved successfully')
  @ApiOperation({ summary: 'Get all users (Admin only)' })
  @ApiOkResponse({ type: PaginatedApiResponseOf(UserResponseDto) })
  findAll(@Query() query: UserQueryDto) {
    return this.usersService.findAll(query);
  }

  @Get(':id')
  @ResponseMessage('User retrieved successfully')
  @ApiOperation({ summary: 'Get a user by ID (Admin only)' })
  @ApiParam({ name: 'id', description: 'User UUID' })
  @ApiOkResponse({ type: ApiResponseOf(UserResponseDto) })
  @ApiNotFoundResponse({ description: 'User not found.' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @ResponseMessage('User updated successfully')
  @ApiOperation({ summary: 'Update a user by ID (Admin only)' })
  @ApiParam({ name: 'id', description: 'User UUID' })
  @ApiOkResponse({ type: ApiResponseOf(UserResponseDto) })
  @ApiNotFoundResponse({ description: 'User not found.' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }

  @Delete(':id')
  @ResponseMessage('User deleted successfully')
  @ApiOperation({ summary: 'Delete a user by ID (Admin only)' })
  @ApiParam({ name: 'id', description: 'User UUID' })
  @ApiOkResponse({ description: 'User deleted successfully.' })
  @ApiNotFoundResponse({ description: 'User not found.' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.remove(id);
  }
}
