import { Injectable } from '@nestjs/common';

export interface HealthCheckResponse {
  status: 'ok';
  timestamp: string;
  uptime: number;
}

@Injectable()
export class AppService {
  private startTime = Date.now();

  getHealthStatus(): HealthCheckResponse {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
    };
  }
}
