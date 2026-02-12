import { Module } from '@nestjs/common';
import { CapsulesService } from './capsules.service';
import { CapsulesController } from './capsules.controller';

@Module({
  providers: [CapsulesService],
  controllers: [CapsulesController]
})
export class CapsulesModule {}
