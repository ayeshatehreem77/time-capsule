import { Controller, Get } from '@nestjs/common';
import { SystemHealthService } from './system-health.service';

@Controller('admin')
export class SystemHealthController {
  constructor(private readonly healthService: SystemHealthService) {}

  @Get('system-health')
  getSystemHealth() {
    return this.healthService.getHealth();
  }
}