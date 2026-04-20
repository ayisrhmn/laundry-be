import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { CustomerResponseDto } from './dto/customer-response.dto';
import { CustomerQueryDto } from './dto/customer-query.dto';
import { PaginatedResult } from '../common/dto/paginated.dto';
import { Prisma } from '@prisma/client';

const CREATED_BY_SELECT = {
  id: true,
  username: true,
  fullName: true,
  role: true,
} as const;

type CustomerWithCreatedBy = Prisma.CustomerGetPayload<{
  include: { createdBy: { select: typeof CREATED_BY_SELECT } };
}>;

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    dto: CreateCustomerDto,
    createdById: string,
  ): Promise<CustomerResponseDto> {
    try {
      const customer = await this.prisma.customer.create({
        data: { ...dto, createdById },
        include: { createdBy: { select: CREATED_BY_SELECT } },
      });
      return this.mapToResponse(customer);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          `Phone number '${dto.phone}' is already registered.`,
        );
      }
      throw error;
    }
  }

  async findAll(
    query: CustomerQueryDto,
  ): Promise<PaginatedResult<CustomerResponseDto>> {
    const { search, page, limit, sort } = query;
    const where: Prisma.CustomerWhereInput = {};

    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.customer.findMany({
        where,
        include: { createdBy: { select: CREATED_BY_SELECT } },
        orderBy: { createdAt: sort === 'oldest' ? 'asc' : 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.customer.count({ where }),
    ]);

    return {
      data: data.map((c) => this.mapToResponse(c)),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<CustomerResponseDto> {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      include: { createdBy: { select: CREATED_BY_SELECT } },
    });
    if (!customer) {
      throw new NotFoundException(`Customer with id '${id}' not found.`);
    }
    return this.mapToResponse(customer);
  }

  async update(
    id: string,
    dto: UpdateCustomerDto,
  ): Promise<CustomerResponseDto> {
    await this.findOne(id);
    try {
      const customer = await this.prisma.customer.update({
        where: { id },
        data: dto,
        include: { createdBy: { select: CREATED_BY_SELECT } },
      });
      return this.mapToResponse(customer);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          `Phone number '${dto.phone}' is already registered.`,
        );
      }
      throw error;
    }
  }

  async remove(id: string): Promise<null> {
    await this.findOne(id);
    await this.prisma.customer.delete({ where: { id } });
    return null;
  }

  private mapToResponse(customer: CustomerWithCreatedBy): CustomerResponseDto {
    return {
      id: customer.id,
      fullName: customer.fullName,
      phone: customer.phone,
      address: customer.address,
      transactionCount: customer.transactionCount,
      createdBy: customer.createdBy,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,
    };
  }
}
