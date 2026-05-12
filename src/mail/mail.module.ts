import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailerService } from './mailer.service'

@Module({
  providers: [MailerService],
  exports: [MailerService],
})
export class MailModule {}
