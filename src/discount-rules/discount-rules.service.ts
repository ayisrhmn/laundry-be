import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDiscountRuleDto } from './dto/create-discount-rule.dto';
import { UpdateDiscountRuleDto } from './dto/update-discount-rule.dto';
import { DiscountRuleResponseDto } from './dto/discount-rule-response.dto';
import { DiscountRuleQueryDto } from './dto/discount-rule-query.dto';
import { PaginatedResult } from '../common/dto/paginated.dto';

@Injectable()
export class DiscountRulesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateDiscountRuleDto): Promise<DiscountRuleResponseDto> {
    try {
      return await this.prisma.discountRule.create({
        data: dto,
      });
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
        orderBy: { minTransaction: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.discountRule.count({ where }),
    ]);

    return {
      data,
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
    });

    if (!rule) {
      throw new NotFoundException(`Discount rule with id '${id}' not found.`);
    }

    return rule;
  }

  async update(
    id: string,
    dto: UpdateDiscountRuleDto,
  ): Promise<DiscountRuleResponseDto> {
    // Check rule exists
    await this.findOne(id);

    try {
      return await this.prisma.discountRule.update({
        where: { id },
        data: dto,
      });
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

    return await this.prisma.discountRule.delete({
      where: { id },
    });
  }
}
