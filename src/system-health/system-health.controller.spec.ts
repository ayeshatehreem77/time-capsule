import { Test, TestingModule } from '@nestjs/testing';
import { SystemHealthController } from './system-health.controller';
import { SystemHealthService } from './system-health.service';

describe('SystemHealthController', () => {
  let controller: SystemHealthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SystemHealthController],
      providers: [SystemHealthService],
    }).compile();

    controller = module.get<SystemHealthController>(SystemHealthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
