import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { DashboardService } from './dashboard.service';
import {
  RecentOrdersQueryDto,
  RevenueTrendQueryDto,
  TopQueryDto,
} from './dto/dashboard-query.dto';
import { DashboardSummaryDto } from './dto/dashboard-summary.dto';
import { RevenueTrendItemDto } from './dto/revenue-trend.dto';
import { OrderStatusBreakdownDto } from './dto/order-status-breakdown.dto';
import { TopServiceItemDto } from './dto/top-services.dto';
import { TopCustomerItemDto } from './dto/top-customers.dto';
import { RecentOrderItemDto } from './dto/recent-orders.dto';
import { DiscountSummaryDto } from './dto/discount-summary.dto';
import { ResponseMessage } from '../common/decorators/response-message.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import {
  ApiArrayResponseOf,
  ApiResponseOf,
} from '../common/dto/api-response.dto';

@ApiTags('Dashboard')
@ApiBearerAuth()
@Roles(UserRole.ADMIN)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  @ResponseMessage('Dashboard summary retrieved successfully')
  @ApiOperation({ summary: 'Get KPI summary cards (Admin only)' })
  @ApiOkResponse({ type: ApiResponseOf(DashboardSummaryDto) })
  getSummary() {
    return this.dashboardService.getSummary();
  }

  @Get('revenue-trend')
  @ResponseMessage('Revenue trend retrieved successfully')
  @ApiOperation({
    summary: 'Get daily revenue trend for a given range (Admin only)',
  })
  @ApiOkResponse({ type: ApiArrayResponseOf(RevenueTrendItemDto) })
  getRevenueTrend(@Query() query: RevenueTrendQueryDto) {
    return this.dashboardService.getRevenueTrend(query);
  }

  @Get('order-breakdown')
  @ResponseMessage('Order breakdown retrieved successfully')
  @ApiOperation({
    summary: 'Get order and payment status breakdown (Admin only)',
  })
  @ApiOkResponse({ type: ApiResponseOf(OrderStatusBreakdownDto) })
  getOrderBreakdown() {
    return this.dashboardService.getOrderBreakdown();
  }

  @Get('top-services')
  @ResponseMessage('Top services retrieved successfully')
  @ApiOperation({ summary: 'Get top services by order count (Admin only)' })
  @ApiOkResponse({ type: ApiArrayResponseOf(TopServiceItemDto) })
  getTopServices(@Query() query: TopQueryDto) {
    return this.dashboardService.getTopServices(query);
  }

  @Get('top-customers')
  @ResponseMessage('Top customers retrieved successfully')
  @ApiOperation({ summary: 'Get top customers by total spending (Admin only)' })
  @ApiOkResponse({ type: ApiArrayResponseOf(TopCustomerItemDto) })
  getTopCustomers(@Query() query: TopQueryDto) {
    return this.dashboardService.getTopCustomers(query);
  }

  @Get('recent-orders')
  @ResponseMessage('Recent orders retrieved successfully')
  @ApiOperation({ summary: 'Get most recent orders (Admin only)' })
  @ApiOkResponse({ type: ApiArrayResponseOf(RecentOrderItemDto) })
  getRecentOrders(@Query() query: RecentOrdersQueryDto) {
    return this.dashboardService.getRecentOrders(query);
  }

  @Get('discount-summary')
  @ResponseMessage('Discount summary retrieved successfully')
  @ApiOperation({
    summary: 'Get discount summary for current month (Admin only)',
  })
  @ApiOkResponse({ type: ApiResponseOf(DiscountSummaryDto) })
  getDiscountSummary() {
    return this.dashboardService.getDiscountSummary();
  }
}
