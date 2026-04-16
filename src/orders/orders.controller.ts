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
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderResponseDto } from './dto/order-response.dto';
import { OrderQueryDto } from './dto/order-query.dto';
import { ResponseMessage } from '../common/decorators/response-message.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import {
  ApiResponseOf,
  PaginatedApiResponseOf,
} from '../common/dto/api-response.dto';

@ApiTags('Orders')
@ApiBearerAuth()
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Roles(UserRole.ADMIN, UserRole.OPERATOR)
  @Post()
  @ResponseMessage('Order created successfully')
  @ApiOperation({
    summary: 'Create a new order (Admin and Operator)',
  })
  @ApiCreatedResponse({ type: ApiResponseOf(OrderResponseDto) })
  @ApiNotFoundResponse({ description: 'Customer or service not found.' })
  @ApiBadRequestResponse({ description: 'Invalid request data.' })
  create(@Body() dto: CreateOrderDto) {
    return this.ordersService.create(dto);
  }

  @Roles(UserRole.ADMIN, UserRole.OPERATOR)
  @Get()
  @ResponseMessage('Orders retrieved successfully')
  @ApiOperation({
    summary:
      'Retrieve orders with optional filters and pagination (Admin and Operator)',
  })
  @ApiOkResponse({ type: PaginatedApiResponseOf(OrderResponseDto) })
  findAll(@Query() query: OrderQueryDto) {
    return this.ordersService.findAll(query);
  }

  @Get('archived')
  @ResponseMessage('Archived orders retrieved successfully')
  @ApiOperation({
    summary: 'Retrieve deleted (archived) orders (Admin only)',
  })
  @ApiOkResponse({ type: PaginatedApiResponseOf(OrderResponseDto) })
  findArchived(@Query() query: OrderQueryDto) {
    return this.ordersService.findArchived(query);
  }

  @Roles(UserRole.ADMIN, UserRole.OPERATOR)
  @Get(':id')
  @ResponseMessage('Order retrieved successfully')
  @ApiOperation({ summary: 'Get an order by ID (Admin and Operator)' })
  @ApiParam({ name: 'id', description: 'Order UUID' })
  @ApiOkResponse({ type: ApiResponseOf(OrderResponseDto) })
  @ApiNotFoundResponse({ description: 'Order not found.' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.ordersService.findOne(id);
  }

  @Roles(UserRole.ADMIN, UserRole.OPERATOR)
  @Patch(':id')
  @ResponseMessage('Order updated successfully')
  @ApiOperation({
    summary: 'Update order status/payment (Admin and Operator)',
  })
  @ApiParam({ name: 'id', description: 'Order UUID' })
  @ApiOkResponse({ type: ApiResponseOf(OrderResponseDto) })
  @ApiNotFoundResponse({ description: 'Order not found.' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateOrderDto) {
    return this.ordersService.update(id, dto);
  }

  @Roles(UserRole.ADMIN, UserRole.OPERATOR)
  @Delete(':id')
  @ResponseMessage('Order cancelled successfully')
  @ApiOperation({
    summary: 'Cancel (soft delete) an order (Admin and Operator)',
  })
  @ApiParam({ name: 'id', description: 'Order UUID' })
  @ApiOkResponse({ type: ApiResponseOf(OrderResponseDto) })
  @ApiNotFoundResponse({ description: 'Order not found.' })
  delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.ordersService.delete(id);
  }
}
