import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  Prisma,
  DiscountType,
  DiscountSource,
  PaymentStatus,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderResponseDto } from './dto/order-response.dto';
import { OrderQueryDto } from './dto/order-query.dto';
import { PaginatedResult } from '../common/dto/paginated.dto';

const ORDER_INCLUDE = {
  items: { include: { service: true } },
  customer: {
    select: {
      id: true,
      fullName: true,
      phone: true,
      address: true,
      transactionCount: true,
    },
  },
  createdBy: {
    select: {
      id: true,
      username: true,
      fullName: true,
      role: true,
    },
  },
  discountRule: {
    select: {
      id: true,
      name: true,
      minTransaction: true,
      isRepeatable: true,
      discountType: true,
      discountValue: true,
      maxDiscountAmount: true,
    },
  },
} as const;

type OrderWithItems = Prisma.OrderGetPayload<{
  include: typeof ORDER_INCLUDE;
}>;

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    dto: CreateOrderDto,
    createdById: string,
  ): Promise<OrderResponseDto> {
    // Validate customer exists
    const customer = await this.prisma.customer.findUnique({
      where: { id: dto.customerId },
    });
    if (!customer) {
      throw new NotFoundException(
        `Customer with id '${dto.customerId}' not found.`,
      );
    }

    // Validate all services exist and get their prices
    const serviceIds = [...new Set(dto.items.map((item) => item.serviceId))];
    const services = await this.prisma.service.findMany({
      where: { id: { in: serviceIds } },
    });

    if (services.length !== serviceIds.length) {
      throw new BadRequestException('One or more services not found.');
    }

    const serviceMap = new Map(services.map((s) => [s.id, s]));

    // Calculate subtotal and prepare items
    let subtotal = 0;
    const orderItems: Prisma.OrderItemCreateNestedManyWithoutOrderInput = {
      create: dto.items.map((item) => {
        const service = serviceMap.get(item.serviceId)!;
        const itemSubtotal = Math.floor(item.qty * service.price);
        subtotal += itemSubtotal;

        return {
          serviceId: item.serviceId,
          qty: item.qty,
          price: service.price,
          subtotal: itemSubtotal,
        };
      }),
    };

    // Auto-detect applicable discount rule based on transaction count
    let discountAmount = 0;
    let discountType: DiscountType | null = null;
    let discountValue = 0;
    let discountSource: DiscountSource | null = null;
    let discountRuleId: string | null = null;

    // If manual discount provided, use it
    if (
      dto.manualDiscountType &&
      dto.manualDiscountValue !== undefined &&
      dto.manualDiscountValue !== null
    ) {
      discountType = dto.manualDiscountType;
      discountValue = dto.manualDiscountValue;
      discountSource = DiscountSource.MANUAL;

      if (dto.manualDiscountType === DiscountType.PERCENTAGE) {
        discountAmount = Math.floor((subtotal * dto.manualDiscountValue) / 100);
      } else {
        discountAmount = Math.min(dto.manualDiscountValue, subtotal);
      }
    } else {
      // Find applicable auto-discount rule based on transaction count
      // Next transaction will be: customer.transactionCount + 1
      const nextTransactionCount = customer.transactionCount + 1;

      const allRules = await this.prisma.discountRule.findMany({
        where: {
          minTransaction: { lte: nextTransactionCount },
        },
        orderBy: { minTransaction: 'desc' },
      });

      let applicableRule: (typeof allRules)[0] | null = null;
      for (const rule of allRules) {
        if (rule.isRepeatable) {
          // Repeatable: apply when nextTransactionCount is a multiple of minTransaction
          if (nextTransactionCount % rule.minTransaction === 0) {
            applicableRule = rule;
            break;
          }
        } else {
          // Non-repeatable: apply only on first reach of minTransaction threshold
          if (
            customer.transactionCount < rule.minTransaction &&
            nextTransactionCount >= rule.minTransaction
          ) {
            applicableRule = rule;
            break;
          }
        }
      }

      if (applicableRule) {
        discountType = applicableRule.discountType;
        discountValue = applicableRule.discountValue;
        discountSource = DiscountSource.AUTO;
        discountRuleId = applicableRule.id;

        if (applicableRule.discountType === 'PERCENTAGE') {
          const amount = Math.floor(
            (subtotal * applicableRule.discountValue) / 100,
          );
          discountAmount = applicableRule.maxDiscountAmount
            ? Math.min(amount, applicableRule.maxDiscountAmount)
            : amount;
        } else {
          discountAmount = applicableRule.maxDiscountAmount
            ? Math.min(
                applicableRule.discountValue,
                applicableRule.maxDiscountAmount,
              )
            : applicableRule.discountValue;
        }
      }
    }

    const totalPrice = subtotal - discountAmount;

    // Day boundaries in the server's local timezone. The date label is derived
    // from the same boundary used for counting, so the label and the counted
    // range can never disagree (e.g. around midnight).
    const startOfDay = new Date(new Date().setHours(0, 0, 0, 0));
    const endOfDay = new Date(new Date().setHours(23, 59, 59, 999));
    const datePart = `${startOfDay.getFullYear()}${String(
      startOfDay.getMonth() + 1,
    ).padStart(2, '0')}${String(startOfDay.getDate()).padStart(2, '0')}`;

    // The order number is generated inside the transaction and retried on a
    // unique collision, so concurrent creates can never hand out the same
    // number. The count includes soft-deleted orders so a deleted order never
    // frees up its number for reuse (which would collide with an existing one).
    const MAX_RETRIES = 5;
    for (let attempt = 0; ; attempt++) {
      try {
        return await this.prisma.$transaction(async (tx) => {
          const dailyOrderCount = await tx.order.count({
            where: { createdAt: { gte: startOfDay, lt: endOfDay } },
          });
          const orderNumber = `ORD-${datePart}-${String(
            dailyOrderCount + 1,
          ).padStart(3, '0')}`;

          // Create order with items
          const order = await tx.order.create({
            data: {
              orderNumber,
              customerId: dto.customerId,
              createdById,
              paymentStatus: dto.paymentStatus ?? PaymentStatus.UNPAID,
              subtotal,
              discountType: discountType ?? undefined,
              discountValue,
              discountAmount,
              discountSource: discountSource ?? undefined,
              discountRuleId: discountRuleId ?? undefined,
              totalPrice,
              items: orderItems,
            },
            include: ORDER_INCLUDE,
          });

          // Increment customer transaction count only if order is created as PAID
          if (dto.paymentStatus === PaymentStatus.PAID) {
            await tx.customer.update({
              where: { id: dto.customerId },
              data: { transactionCount: { increment: 1 } },
            });
          }

          return this.mapOrderToResponse(order);
        });
      } catch (error) {
        // Retry only on a unique-constraint collision on the order number,
        // which can happen when two orders are created at the same instant.
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === 'P2002' &&
          attempt < MAX_RETRIES
        ) {
          continue;
        }
        throw error;
      }
    }
  }

  async findAll(
    query: OrderQueryDto,
  ): Promise<PaginatedResult<OrderResponseDto>> {
    const {
      search,
      customerId,
      orderStatus,
      paymentStatus,
      dateFrom,
      dateTo,
      discountType,
      hasDiscount,
      minAmount,
      maxAmount,
      page = 1,
      limit = 10,
      sort = 'newest',
    } = query;
    const where: Prisma.OrderWhereInput = {
      deletedAt: null, // Exclude soft-deleted orders
    };

    if (search) where.orderNumber = { contains: search, mode: 'insensitive' };
    if (customerId) where.customerId = customerId;
    if (orderStatus) where.orderStatus = orderStatus;
    if (paymentStatus) where.paymentStatus = paymentStatus;
    if (discountType) where.discountType = discountType;

    // Filter by discount presence
    if (hasDiscount !== undefined) {
      where.discountAmount = hasDiscount ? { gt: 0 } : { equals: 0 };
    }

    // Filter by amount range
    if (minAmount !== undefined || maxAmount !== undefined) {
      where.totalPrice = {};
      if (minAmount !== undefined) {
        where.totalPrice.gte = minAmount;
      }
      if (maxAmount !== undefined) {
        where.totalPrice.lte = maxAmount;
      }
    }

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        where.createdAt.gte = new Date(dateFrom);
      }
      if (dateTo) {
        const toDate = new Date(dateTo);
        toDate.setHours(23, 59, 59, 999);
        where.createdAt.lte = toDate;
      }
    }

    const orderBy: Prisma.OrderOrderByWithRelationInput =
      sort === 'newest_amount'
        ? { totalPrice: 'desc' }
        : sort === 'oldest_amount'
          ? { totalPrice: 'asc' }
          : { createdAt: sort === 'newest' ? 'desc' : 'asc' };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.order.findMany({
        where,
        include: ORDER_INCLUDE,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      data: data.map((order) => this.mapOrderToResponse(order)),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findArchived(
    query: OrderQueryDto,
  ): Promise<PaginatedResult<OrderResponseDto>> {
    const {
      customerId,
      orderStatus,
      paymentStatus,
      dateFrom,
      dateTo,
      page = 1,
      limit = 10,
    } = query;
    const where: Prisma.OrderWhereInput = {
      deletedAt: { not: null }, // Only soft-deleted orders
    };

    if (customerId) where.customerId = customerId;
    if (orderStatus) where.orderStatus = orderStatus;
    if (paymentStatus) where.paymentStatus = paymentStatus;

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        where.createdAt.gte = new Date(dateFrom);
      }
      if (dateTo) {
        const toDate = new Date(dateTo);
        toDate.setHours(23, 59, 59, 999);
        where.createdAt.lte = toDate;
      }
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.order.findMany({
        where,
        include: ORDER_INCLUDE,
        orderBy: { deletedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      data: data.map((order) => this.mapOrderToResponse(order)),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<OrderResponseDto> {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: ORDER_INCLUDE,
    });

    if (!order) {
      throw new NotFoundException(`Order with id '${id}' not found.`);
    }

    // Check if soft deleted
    if (order.deletedAt) {
      throw new NotFoundException(`Order with id '${id}' not found.`);
    }

    return this.mapOrderToResponse(order);
  }

  async update(id: string, dto: UpdateOrderDto): Promise<OrderResponseDto> {
    // Get current order first
    const currentOrder = await this.findOne(id);
    const wasUnpaid = currentOrder.paymentStatus === PaymentStatus.UNPAID;
    const willBePaid = dto.paymentStatus === PaymentStatus.PAID;

    const updated = await this.prisma.$transaction(async (tx) => {
      // Update order
      const result = await tx.order.update({
        where: { id },
        data: dto,
        include: ORDER_INCLUDE,
      });

      // Increment transaction count if payment status changes from UNPAID to PAID
      if (wasUnpaid && willBePaid) {
        await tx.customer.update({
          where: { id: result.customerId },
          data: { transactionCount: { increment: 1 } },
        });
      }

      return result;
    });

    return this.mapOrderToResponse(updated);
  }

  async delete(id: string): Promise<OrderResponseDto> {
    const order = await this.findOne(id);

    return await this.prisma.$transaction(async (tx) => {
      // Soft delete order
      const deleted = await tx.order.update({
        where: { id },
        data: { deletedAt: new Date() },
        include: ORDER_INCLUDE,
      });

      // Decrement customer transaction count only if order was PAID
      if (order.paymentStatus === PaymentStatus.PAID) {
        await tx.customer.update({
          where: { id: order.customerId },
          data: { transactionCount: { decrement: 1 } },
        });
      }

      return this.mapOrderToResponse(deleted);
    });
  }

  private mapOrderToResponse(order: OrderWithItems): OrderResponseDto {
    return {
      id: order.id,
      orderNumber: order.orderNumber,
      customerId: order.customerId,
      customer: order.customer,
      createdBy: order.createdBy,
      orderStatus: order.orderStatus,
      paymentStatus: order.paymentStatus,
      subtotal: order.subtotal,
      discountType: order.discountType,
      discountValue: order.discountValue,
      discountAmount: order.discountAmount,
      discountSource: order.discountSource,
      discountRule: order.discountRule,
      totalPrice: order.totalPrice,
      items: order.items.map((item) => ({
        id: item.id,
        serviceId: item.serviceId,
        serviceName: item.service.name,
        serviceUnit: item.service.unit,
        qty: item.qty,
        price: item.price,
        subtotal: item.subtotal,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      })),
      deletedAt: order.deletedAt ?? null,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }
}
