import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

export const createMailer = (configService: ConfigService) => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: configService.get<string>('EMAIL_USER'),
      pass: configService.get<string>('EMAIL_PASS'),
    },
  });
};
