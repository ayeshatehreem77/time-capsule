import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { CapsulesModule } from './capsules/capsules.module'


@Module({
  imports: [
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
  ],
})
export class AppModule {}
