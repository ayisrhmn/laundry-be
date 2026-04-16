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

type ServiceWithCreatedBy = Prisma.ServiceGetPayload<{
  include: { createdBy: { select: typeof CREATED_BY_SELECT } };
}>;
import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { ServiceResponseDto } from './dto/service-response.dto';
import { PaginatedResult } from '../common/dto/paginated.dto';

@Injectable()
export class ServicesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    dto: CreateServiceDto,
    createdById: string,
  ): Promise<ServiceResponseDto> {
    try {
      const service = await this.prisma.service.create({
        data: { ...dto, createdById },
        include: { createdBy: { select: CREATED_BY_SELECT } },
      });
      return this.mapToResponse(service);
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
        include: { createdBy: { select: CREATED_BY_SELECT } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.service.count({ where }),
    ]);

    return {
      data: data.map((s) => this.mapToResponse(s)),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<ServiceResponseDto> {
    const service = await this.prisma.service.findUnique({
      where: { id },
      include: { createdBy: { select: CREATED_BY_SELECT } },
    });
    if (!service) {
      throw new NotFoundException(`Service with id '${id}' not found.`);
    }
    return this.mapToResponse(service);
  }

  async update(id: string, dto: UpdateServiceDto): Promise<ServiceResponseDto> {
    await this.findOne(id);

    try {
      const service = await this.prisma.service.update({
        where: { id },
        data: dto,
        include: { createdBy: { select: CREATED_BY_SELECT } },
      });
      return this.mapToResponse(service);
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
    const service = await this.prisma.service.delete({
      where: { id },
      include: { createdBy: { select: CREATED_BY_SELECT } },
    });
    return this.mapToResponse(service);
  }

  private mapToResponse(service: ServiceWithCreatedBy): ServiceResponseDto {
    return {
      id: service.id,
      name: service.name,
      unit: service.unit,
      price: service.price,
      createdBy: service.createdBy,
      createdAt: service.createdAt,
      updatedAt: service.updatedAt,
    };
  }
}
