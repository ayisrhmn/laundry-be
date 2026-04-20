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
import { UserRole } from '@prisma/client';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { ServiceResponseDto } from './dto/service-response.dto';
import { ServiceQueryDto } from './dto/service-query.dto';
import { ResponseMessage } from '../common/decorators/response-message.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import {
  ApiResponseOf,
  PaginatedApiResponseOf,
} from '../common/dto/api-response.dto';

@ApiTags('Services')
@ApiBearerAuth()
@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Post()
  @ResponseMessage('Service created successfully')
  @ApiOperation({ summary: 'Create a new service (Admin only)' })
  @ApiCreatedResponse({ type: ApiResponseOf(ServiceResponseDto) })
  @ApiConflictResponse({ description: 'Service name already registered.' })
  create(
    @Request() req: { user: { id: string } },
    @Body() dto: CreateServiceDto,
  ) {
    return this.servicesService.create(dto, req.user.id);
  }

  @Roles(UserRole.ADMIN, UserRole.OPERATOR)
  @Get()
  @ResponseMessage('Services retrieved successfully')
  @ApiOperation({
    summary:
      'Retrieve all services with optional search and pagination (Admin and Operator)',
  })
  @ApiOkResponse({ type: PaginatedApiResponseOf(ServiceResponseDto) })
  findAll(@Query() query: ServiceQueryDto) {
    return this.servicesService.findAll(query);
  }

  @Roles(UserRole.ADMIN, UserRole.OPERATOR)
  @Get(':id')
  @ResponseMessage('Service retrieved successfully')
  @ApiOperation({ summary: 'Get a service by ID (Admin and Operator)' })
  @ApiParam({ name: 'id', description: 'Service UUID' })
  @ApiOkResponse({ type: ApiResponseOf(ServiceResponseDto) })
  @ApiNotFoundResponse({ description: 'Service not found.' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.servicesService.findOne(id);
  }

  @Patch(':id')
  @ResponseMessage('Service updated successfully')
  @ApiOperation({ summary: 'Update a service by ID (Admin only)' })
  @ApiParam({ name: 'id', description: 'Service UUID' })
  @ApiOkResponse({ type: ApiResponseOf(ServiceResponseDto) })
  @ApiNotFoundResponse({ description: 'Service not found.' })
  @ApiConflictResponse({ description: 'Service name already registered.' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateServiceDto,
  ) {
    return this.servicesService.update(id, dto);
  }

  @Delete(':id')
  @ResponseMessage('Service deleted successfully')
  @ApiOperation({ summary: 'Delete a service by ID (Admin only)' })
  @ApiParam({ name: 'id', description: 'Service UUID' })
  @ApiOkResponse({ description: 'Service deleted successfully.' })
  @ApiNotFoundResponse({ description: 'Service not found.' })
  delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.servicesService.delete(id);
  }
}
