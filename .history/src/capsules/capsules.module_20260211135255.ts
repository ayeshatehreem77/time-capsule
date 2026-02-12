import { Module } from '@nestjs/common';
import { CapsulesService } from './capsules.service';
import { CapsulesController } from './capsules.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Capsule, CapsuleSchema } from './capsule.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Capsule.name, schema: CapsuleSchema },
    ]),
  ],

  providers: [CapsulesService],
  controllers: [CapsulesController]
})
export class CapsulesModule { }
