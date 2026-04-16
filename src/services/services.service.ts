import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { ServiceResponseDto } from './dto/service-response.dto';
import { PaginatedResult } from '../common/dto/paginated.dto';

@Injectable()
export class ServicesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateServiceDto): Promise<ServiceResponseDto> {
    try {
      return await this.prisma.service.create({ data: dto });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          `Service name '${dto.name}' is already registered.`,
        );
      }
      throw error;
    }
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    name?: string,
  ): Promise<PaginatedResult<ServiceResponseDto>> {
    const where: Prisma.ServiceWhereInput = {};

    if (name) where.name = { contains: name, mode: 'insensitive' };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.service.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.service.count({ where }),
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

  async findOne(id: string): Promise<ServiceResponseDto> {
    const service = await this.prisma.service.findUnique({ where: { id } });
    if (!service) {
      throw new NotFoundException(`Service with id '${id}' not found.`);
    }
    return service;
  }

  async update(id: string, dto: UpdateServiceDto): Promise<ServiceResponseDto> {
    await this.findOne(id);

    try {
      return await this.prisma.service.update({
        where: { id },
        data: dto,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          `Service name '${dto.name}' is already registered.`,
        );
      }
      throw error;
    }
  }

  async delete(id: string): Promise<ServiceResponseDto> {
    await this.findOne(id);
    return await this.prisma.service.delete({ where: { id } });
  }
}
