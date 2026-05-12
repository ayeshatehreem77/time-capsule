import { Module } from '@nestjs/common';
import { CapsulesService } from './capsules.service';
import { CapsulesController } from './capsules.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Capsule, CapsuleSchema } from './capsule.schema';
import { UnlockScheduler } from './unlock.scheduler';
import { MailModule } from '../mail/mail.module';
import { UsersModule } from '../users/users.module';
import { AdminModule } from '../admin/admin.module'
import {User, UserSchema} from "../users/user.schema"

@Module({
  imports: [
    MailModule,
    MongooseModule.forFeature([
      { name: Capsule.name, schema: CapsuleSchema },
      { name: User.name, schema: UserSchema }
    ]),
    UsersModule,
    AdminModule,
  ],

  providers: [CapsulesService, UnlockScheduler],
  controllers: [CapsulesController]
})
export class CapsulesModule { }
