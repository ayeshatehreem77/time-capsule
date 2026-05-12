import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../users/user.schema';
import { Capsule, CapsuleSchema } from '../capsules/capsule.schema';
import { Log, LogSchema } from './schemas/log.schema';
import {RolesGuard} from '../auth/guards/roles.guard'
import {NotificationGateway} from '../admin/admin.gateway'


@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Capsule.name, schema: CapsuleSchema },
      { name: Log.name, schema: LogSchema },
    ]),
  ],
  controllers: [AdminController],
  providers: [AdminService, RolesGuard,  NotificationGateway ],
  exports: [AdminService, NotificationGateway],
})
export class AdminModule {}