import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Request,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { CustomerResponseDto } from './dto/customer-response.dto';
import { CustomerQueryDto } from './dto/customer-query.dto';
import { ResponseMessage } from '../common/decorators/response-message.decorator';
import {
  ApiResponseOf,
  PaginatedApiResponseOf,
} from '../common/dto/api-response.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Customers')
@ApiBearerAuth()
@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Roles(UserRole.ADMIN, UserRole.OPERATOR)
  @Post()
  @ResponseMessage('Customer created successfully')
  @ApiOperation({ summary: 'Create a new customer (Admin and Operator)' })
  @ApiCreatedResponse({ type: ApiResponseOf(CustomerResponseDto) })
  @ApiConflictResponse({ description: 'Phone number already registered.' })
  create(
    @Request() req: { user: { id: string } },
    @Body() dto: CreateCustomerDto,
  ) {
    return this.customersService.create(dto, req.user.id);
  }

  @Roles(UserRole.ADMIN, UserRole.OPERATOR)
  @Get()
  @ResponseMessage('Customers retrieved successfully')
  @ApiOperation({
    summary:
      'Retrieve customers with optional search and pagination (Admin and Operator)',
  })
  @ApiOkResponse({ type: PaginatedApiResponseOf(CustomerResponseDto) })
  findAll(@Query() query: CustomerQueryDto) {
    return this.customersService.findAll(query);
  }

  @Roles(UserRole.ADMIN, UserRole.OPERATOR)
  @Get(':id')
  @ResponseMessage('Customer retrieved successfully')
  @ApiOperation({ summary: 'Get a customer by ID (Admin and Operator)' })
  @ApiParam({ name: 'id', description: 'Customer UUID' })
  @ApiOkResponse({ type: ApiResponseOf(CustomerResponseDto) })
  @ApiNotFoundResponse({ description: 'Customer not found.' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.customersService.findOne(id);
  }

  @Roles(UserRole.ADMIN, UserRole.OPERATOR)
  @Patch(':id')
  @ResponseMessage('Customer updated successfully')
  @ApiOperation({ summary: 'Update a customer by ID (Admin and Operator)' })
  @ApiParam({ name: 'id', description: 'Customer UUID' })
  @ApiOkResponse({ type: ApiResponseOf(CustomerResponseDto) })
  @ApiNotFoundResponse({ description: 'Customer not found.' })
  @ApiConflictResponse({ description: 'Phone number already registered.' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCustomerDto,
  ) {
    return this.customersService.update(id, dto);
  }

  @Delete(':id')
  @ResponseMessage('Customer deleted successfully')
  @ApiOperation({ summary: 'Delete a customer by ID (Admin only)' })
  @ApiParam({ name: 'id', description: 'Customer UUID' })
  @ApiOkResponse({ description: 'Customer deleted successfully.' })
  @ApiNotFoundResponse({ description: 'Customer not found.' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.customersService.remove(id);
  }
}
