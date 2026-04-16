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
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { DiscountRulesService } from './discount-rules.service';
import { CreateDiscountRuleDto } from './dto/create-discount-rule.dto';
import { UpdateDiscountRuleDto } from './dto/update-discount-rule.dto';
import { DiscountRuleResponseDto } from './dto/discount-rule-response.dto';
import { DiscountRuleQueryDto } from './dto/discount-rule-query.dto';
import { ResponseMessage } from '../common/decorators/response-message.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import {
  ApiResponseOf,
  PaginatedApiResponseOf,
} from '../common/dto/api-response.dto';

@ApiTags('Discount Rules')
@ApiBearerAuth()
@Controller('discount-rules')
export class DiscountRulesController {
  constructor(private readonly discountRulesService: DiscountRulesService) {}

  @Roles(UserRole.ADMIN)
  @Post()
  @ResponseMessage('Discount rule created successfully')
  @ApiOperation({
    summary: 'Create a new discount rule (Admin only)',
  })
  @ApiCreatedResponse({ type: ApiResponseOf(DiscountRuleResponseDto) })
  @ApiBadRequestResponse({ description: 'Invalid request data.' })
  @ApiConflictResponse({
    description: 'Discount rule with this name already exists.',
  })
  create(@Body() dto: CreateDiscountRuleDto) {
    return this.discountRulesService.create(dto);
  }

  @Roles(UserRole.ADMIN, UserRole.OPERATOR)
  @Get()
  @ResponseMessage('Discount rules retrieved successfully')
  @ApiOperation({
    summary:
      'Retrieve discount rules with optional filters and pagination (Admin and Operator)',
  })
  @ApiOkResponse({
    type: PaginatedApiResponseOf(DiscountRuleResponseDto),
    description: 'Paginated list of discount rules',
  })
  findAll(@Query() query: DiscountRuleQueryDto) {
    return this.discountRulesService.findAll(query);
  }

  @Roles(UserRole.ADMIN, UserRole.OPERATOR)
  @Get(':id')
  @ResponseMessage('Discount rule retrieved successfully')
  @ApiOperation({ summary: 'Get a discount rule by ID (Admin and Operator)' })
  @ApiParam({ name: 'id', description: 'Discount rule UUID' })
  @ApiOkResponse({ type: ApiResponseOf(DiscountRuleResponseDto) })
  @ApiNotFoundResponse({ description: 'Discount rule not found.' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.discountRulesService.findOne(id);
  }

  @Roles(UserRole.ADMIN)
  @Patch(':id')
  @ResponseMessage('Discount rule updated successfully')
  @ApiOperation({
    summary: 'Update a discount rule (Admin only)',
  })
  @ApiParam({ name: 'id', description: 'Discount rule UUID' })
  @ApiOkResponse({ type: ApiResponseOf(DiscountRuleResponseDto) })
  @ApiNotFoundResponse({ description: 'Discount rule not found.' })
  @ApiBadRequestResponse({ description: 'Invalid request data.' })
  @ApiConflictResponse({
    description: 'Discount rule with this name already exists.',
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDiscountRuleDto,
  ) {
    return this.discountRulesService.update(id, dto);
  }

  @Roles(UserRole.ADMIN)
  @Delete(':id')
  @ResponseMessage('Discount rule deleted successfully')
  @ApiOperation({ summary: 'Delete a discount rule (Admin only)' })
  @ApiParam({ name: 'id', description: 'Discount rule UUID' })
  @ApiOkResponse({ type: ApiResponseOf(DiscountRuleResponseDto) })
  @ApiNotFoundResponse({ description: 'Discount rule not found.' })
  delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.discountRulesService.delete(id);
  }
}
