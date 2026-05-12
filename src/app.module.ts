import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { CapsulesModule } from './capsules/capsules.module'
import { AdminController } from './admin/admin.controller';
import { ScheduleModule } from '@nestjs/schedule';
import { MailModule } from './mail/mail.module';
import { AdminModule } from './admin/admin.module';
import { SystemHealthModule } from './system-health/system-health.module';
import { PaymentsModule } from './payments/payments.module';


@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({ isGlobal: true }),

    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('MONGO_URI'),
      }),
    }),
    UsersModule,
    AuthModule,
    CapsulesModule,
    MailModule,
    AdminModule,
    SystemHealthModule,
    PaymentsModule,
  ],
   
})
export class AppModule { }
