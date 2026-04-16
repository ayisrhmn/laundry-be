import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';
import type { HealthCheckResponse } from './app.service';
import { Public } from './common/decorators/public.decorator';

@ApiTags('Health')
@Controller('health')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get()
  @ApiOperation({
    summary: 'Health check endpoint (Public)',
    description: 'Check if the application is running and responsive',
  })
  @ApiResponse({
    status: 200,
    description: 'Application is healthy',
    schema: {
      example: {
        status: 'ok',
        timestamp: '2026-04-15T21:30:00.000Z',
        uptime: 120,
      },
    },
  })
  getHealth(): HealthCheckResponse {
    return this.appService.getHealthStatus();
  }
}
