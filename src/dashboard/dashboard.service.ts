import { Injectable } from '@nestjs/common';
import { ServiceUnit } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { DashboardSummaryDto } from './dto/dashboard-summary.dto';
import {
  RevenueTrendRange,
  RevenueTrendQueryDto,
  TopQueryDto,
  RecentOrdersQueryDto,
} from './dto/dashboard-query.dto';
import { RevenueTrendItemDto } from './dto/revenue-trend.dto';
import { OrderStatusBreakdownDto } from './dto/order-status-breakdown.dto';
import { TopServiceItemDto } from './dto/top-services.dto';
import { TopCustomerItemDto } from './dto/top-customers.dto';
import { RecentOrderItemDto } from './dto/recent-orders.dto';
import { DiscountSummaryDto } from './dto/discount-summary.dto';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary(): Promise<DashboardSummaryDto> {
    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      0,
      0,
      0,
      0,
    );
    const endOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      23,
      59,
      59,
      999,
    );
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    );

    const [
      revenueTodayAgg,
      revenueMonthAgg,
      orderTodayCount,
      orderPendingCount,
      orderUnpaidAgg,
      totalActiveCustomers,
    ] = await this.prisma.$transaction([
      this.prisma.order.aggregate({
        _sum: { totalPrice: true },
        where: {
          paymentStatus: 'PAID',
          deletedAt: null,
          createdAt: { gte: startOfToday, lte: endOfToday },
        },
      }),
      this.prisma.order.aggregate({
        _sum: { totalPrice: true },
        where: {
          paymentStatus: 'PAID',
          deletedAt: null,
          createdAt: { gte: startOfMonth, lte: endOfMonth },
        },
      }),
      this.prisma.order.count({
        where: {
          deletedAt: null,
          createdAt: { gte: startOfToday, lte: endOfToday },
        },
      }),
      this.prisma.order.count({
        where: { orderStatus: 'PENDING', deletedAt: null },
      }),
      this.prisma.order.aggregate({
        _sum: { totalPrice: true },
        _count: true,
        where: { paymentStatus: 'UNPAID', deletedAt: null },
      }),
      this.prisma.customer.count({
        where: { transactionCount: { gt: 0 } },
      }),
    ]);

    return {
      revenueTodayTotal: revenueTodayAgg._sum.totalPrice ?? 0,
      revenueMonthTotal: revenueMonthAgg._sum.totalPrice ?? 0,
      orderTodayCount,
      orderPendingCount,
      orderUnpaidCount: orderUnpaidAgg._count,
      orderUnpaidTotal: orderUnpaidAgg._sum.totalPrice ?? 0,
      totalActiveCustomers,
    };
  }

  async getRevenueTrend(
    query: RevenueTrendQueryDto,
  ): Promise<RevenueTrendItemDto[]> {
    const range = query.range ?? RevenueTrendRange.THIRTY_DAYS;
    const now = new Date();
    let startDate: Date;

    if (range === RevenueTrendRange.TODAY) {
      startDate = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        0,
        0,
        0,
        0,
      );
    } else if (range === RevenueTrendRange.SEVEN_DAYS) {
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 6);
      startDate.setHours(0, 0, 0, 0);
    } else if (range === RevenueTrendRange.THIS_MONTH) {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    } else {
      // 30d (default)
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 29);
      startDate.setHours(0, 0, 0, 0);
    }

    const rows = await this.prisma.$queryRaw<{ date: Date; revenue: bigint }[]>`
      SELECT DATE(created_at) AS date, COALESCE(SUM(total_price), 0)::bigint AS revenue
      FROM orders
      WHERE payment_status = 'PAID'
        AND deleted_at IS NULL
        AND created_at >= ${startDate}
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `;

    return rows.map((row) => ({
      date: row.date.toISOString().split('T')[0],
      revenue: Number(row.revenue),
    }));
  }

  async getOrderBreakdown(): Promise<OrderStatusBreakdownDto> {
    const [pendingCount, doneCount, unpaidCount, paidCount] =
      await this.prisma.$transaction([
        this.prisma.order.count({
          where: { orderStatus: 'PENDING', deletedAt: null },
        }),
        this.prisma.order.count({
          where: { orderStatus: 'DONE', deletedAt: null },
        }),
        this.prisma.order.count({
          where: { paymentStatus: 'UNPAID', deletedAt: null },
        }),
        this.prisma.order.count({
          where: { paymentStatus: 'PAID', deletedAt: null },
        }),
      ]);

    return {
      orderStatus: { pending: pendingCount, done: doneCount },
      paymentStatus: { unpaid: unpaidCount, paid: paidCount },
    };
  }

  async getTopServices(query: TopQueryDto): Promise<TopServiceItemDto[]> {
    const limit = query.limit ?? 5;

    const rows = await this.prisma.$queryRaw<
      {
        service_id: string;
        service_name: string;
        unit: string;
        order_count: bigint;
        total_revenue: bigint;
      }[]
    >`
      SELECT
        oi.service_id,
        s.name AS service_name,
        s.unit::text AS unit,
        COUNT(oi.id)::bigint AS order_count,
        COALESCE(SUM(oi.subtotal), 0)::bigint AS total_revenue
      FROM order_items oi
      JOIN services s ON s.id = oi.service_id
      JOIN orders o ON o.id = oi.order_id
      WHERE o.deleted_at IS NULL
      GROUP BY oi.service_id, s.name, s.unit
      ORDER BY order_count DESC
      LIMIT ${limit}
    `;

    return rows.map((row) => ({
      serviceId: row.service_id,
      serviceName: row.service_name,
      unit: row.unit as ServiceUnit,
      orderCount: Number(row.order_count),
      totalRevenue: Number(row.total_revenue),
    }));
  }

  async getTopCustomers(query: TopQueryDto): Promise<TopCustomerItemDto[]> {
    const limit = query.limit ?? 5;

    const rows = await this.prisma.$queryRaw<
      {
        customer_id: string;
        customer_name: string;
        phone: string;
        transaction_count: number;
        total_spending: bigint;
      }[]
    >`
      SELECT
        c.id AS customer_id,
        c.name AS customer_name,
        c.phone,
        c.transaction_count,
        COALESCE(SUM(o.total_price), 0)::bigint AS total_spending
      FROM customers c
      LEFT JOIN orders o
        ON o.customer_id = c.id
        AND o.deleted_at IS NULL
        AND o.payment_status = 'PAID'
      GROUP BY c.id, c.name, c.phone, c.transaction_count
      ORDER BY total_spending DESC
      LIMIT ${limit}
    `;

    return rows.map((row) => ({
      customerId: row.customer_id,
      customerName: row.customer_name,
      phone: row.phone,
      transactionCount: row.transaction_count,
      totalSpending: Number(row.total_spending),
    }));
  }

  async getRecentOrders(
    query: RecentOrdersQueryDto,
  ): Promise<RecentOrderItemDto[]> {
    const limit = query.limit ?? 10;

    const orders = await this.prisma.order.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        orderNumber: true,
        totalPrice: true,
        orderStatus: true,
        paymentStatus: true,
        createdAt: true,
        customer: { select: { fullName: true } },
      },
    });

    return orders.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      customerName: o.customer.fullName,
      totalPrice: o.totalPrice,
      orderStatus: o.orderStatus,
      paymentStatus: o.paymentStatus,
      createdAt: o.createdAt,
    }));
  }

  async getDiscountSummary(): Promise<DiscountSummaryDto> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    );

    const baseWhere = {
      discountAmount: { gt: 0 },
      deletedAt: null,
      createdAt: { gte: startOfMonth, lte: endOfMonth },
    };

    const [totalAgg, autoAgg, manualAgg] = await this.prisma.$transaction([
      this.prisma.order.aggregate({
        _sum: { discountAmount: true },
        _count: true,
        where: baseWhere,
      }),
      this.prisma.order.aggregate({
        _sum: { discountAmount: true },
        _count: true,
        where: { ...baseWhere, discountSource: 'AUTO' },
      }),
      this.prisma.order.aggregate({
        _sum: { discountAmount: true },
        _count: true,
        where: { ...baseWhere, discountSource: 'MANUAL' },
      }),
    ]);

    return {
      totalDiscountAmount: totalAgg._sum.discountAmount ?? 0,
      totalOrdersWithDiscount: totalAgg._count,
      autoDiscountCount: autoAgg._count,
      manualDiscountCount: manualAgg._count,
      autoDiscountAmount: autoAgg._sum.discountAmount ?? 0,
      manualDiscountAmount: manualAgg._sum.discountAmount ?? 0,
    };
  }
}
