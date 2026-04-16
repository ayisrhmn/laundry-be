import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';

const CREATED_BY_SELECT = {
  id: true,
  username: true,
  fullName: true,
  role: true,
} as const;

type DiscountRuleWithCreatedBy = Prisma.DiscountRuleGetPayload<{
  include: { createdBy: { select: typeof CREATED_BY_SELECT } };
}>;
import { PrismaService } from '../prisma/prisma.service';
import { CreateDiscountRuleDto } from './dto/create-discount-rule.dto';
import { UpdateDiscountRuleDto } from './dto/update-discount-rule.dto';
import { DiscountRuleResponseDto } from './dto/discount-rule-response.dto';
import { DiscountRuleQueryDto } from './dto/discount-rule-query.dto';
import { PaginatedResult } from '../common/dto/paginated.dto';

@Injectable()
export class DiscountRulesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    dto: CreateDiscountRuleDto,
    createdById: string,
  ): Promise<DiscountRuleResponseDto> {
    try {
      const rule = await this.prisma.discountRule.create({
        data: { ...dto, createdById },
        include: { createdBy: { select: CREATED_BY_SELECT } },
      });
      return this.mapToResponse(rule);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          `Discount rule with name '${dto.name}' already exists.`,
        );
      }
      throw error;
    }
  }

  async findAll(
    query: DiscountRuleQueryDto,
  ): Promise<PaginatedResult<DiscountRuleResponseDto>> {
    const { name, discountType, page = 1, limit = 10 } = query;
    const where: Prisma.DiscountRuleWhereInput = {};

    if (name) where.name = { contains: name, mode: 'insensitive' };
    if (discountType) where.discountType = discountType;

    const [data, total] = await this.prisma.$transaction([
      this.prisma.discountRule.findMany({
        where,
        include: { createdBy: { select: CREATED_BY_SELECT } },
        orderBy: { minTransaction: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.discountRule.count({ where }),
    ]);

    return {
      data: data.map((r) => this.mapToResponse(r)),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<DiscountRuleResponseDto> {
    const rule = await this.prisma.discountRule.findUnique({
      where: { id },
      include: { createdBy: { select: CREATED_BY_SELECT } },
    });

    if (!rule) {
      throw new NotFoundException(`Discount rule with id '${id}' not found.`);
    }

    return this.mapToResponse(rule);
  }

  async update(
    id: string,
    dto: UpdateDiscountRuleDto,
  ): Promise<DiscountRuleResponseDto> {
    // Check rule exists
    await this.findOne(id);

    try {
      const rule = await this.prisma.discountRule.update({
        where: { id },
        data: dto,
        include: { createdBy: { select: CREATED_BY_SELECT } },
      });
      return this.mapToResponse(rule);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          `Discount rule with name '${dto.name}' already exists.`,
        );
      }
      throw error;
    }
  }

  async delete(id: string): Promise<DiscountRuleResponseDto> {
    // Check rule exists
    await this.findOne(id);

    const rule = await this.prisma.discountRule.delete({
      where: { id },
      include: { createdBy: { select: CREATED_BY_SELECT } },
    });
    return this.mapToResponse(rule);
  }

  private mapToResponse(
    rule: DiscountRuleWithCreatedBy,
  ): DiscountRuleResponseDto {
    return {
      id: rule.id,
      name: rule.name,
      minTransaction: rule.minTransaction,
      isRepeatable: rule.isRepeatable,
      discountType: rule.discountType,
      discountValue: rule.discountValue,
      maxDiscountAmount: rule.maxDiscountAmount,
      createdBy: rule.createdBy,
      createdAt: rule.createdAt,
      updatedAt: rule.updatedAt,
    };
  }
}
