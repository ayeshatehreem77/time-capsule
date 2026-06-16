import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailerService {
  private transporter: nodemailer.Transporter;



  constructor(private config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: this.config.get('EMAIL_USER'),
        pass: this.config.get('EMAIL_PASS'),
      },
    });
    this.transporter.verify((error, success) => {
  if (error) {
    console.error('SMTP ERROR:', error);
  } else {
    console.log('SMTP READY');
  }
});
  }

  async sendCapsuleSentEmail(to: string, capsuleTitle: string, recipient: string) {
    return this.transporter.sendMail({
      from: `"TimeCapsule" <${this.config.get('EMAIL_USER')}>`,
      to,
      subject: 'Capsule Sent Successfully 📬',
      text: `Your capsule "${capsuleTitle}" has been sent to ${recipient}.`,
    });
  }

  async sendCapsuleReceivedEmail(
    to: string,
    senderName: string,
    capsuleTitle: string,
  ) {
    return this.transporter.sendMail({
      from: `"TimeCapsule" <${this.config.get('EMAIL_USER')}>`,
      to,
      subject: 'You received a TimeCapsule 🎁',
      text: `${senderName} has sent you a capsule titled "${capsuleTitle}". It will unlock on the scheduled date.`,
    });
  }

  async sendUnlockToReceiverEmail(
    to: string,
    senderName: string,
    title: string,
  ) {
    return this.transporter.sendMail({
      from: `"TimeCapsule" <${this.config.get('EMAIL_USER')}>`,
      to,
      subject: 'Your capsule is unlocked ⏳',
      text: `The capsule "${title}" sent by ${senderName} is now unlocked.`,
    });
  }

  async sendUnlockToSenderEmail(
    to: string,
    recipientEmail: string,
    title: string,
  ) {
    return this.transporter.sendMail({
      from: `"TimeCapsule" <${this.config.get('EMAIL_USER')}>`,
      to,
      subject: 'Capsule Unlocked 🎉',
      text: `The capsule "${title}" you sent to ${recipientEmail} is now unlocked.`,
    });
  }

  async sendBurialToReceiverEmail(
    to: string,
    senderName: string,
    title: string,
    unlockDate: Date,
  ) {

    const formattedDate = new Date(unlockDate).toLocaleString('en-PK', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
    return this.transporter.sendMail({
      to,
      subject: 'A secret has been buried for you ⏳',
      text: `${senderName} has buried a secret capsule for you.\n\nTitle: ${title}\nIt will be revealed on: ${unlockDate}\n\nStay tuned...`,
    });
  }

  async sendBurialToSenderEmail(
    to: string,
    recipientEmail: string,
    title: string,
    unlockDate: Date,
  ) {

    const formattedDate = new Date(unlockDate).toLocaleString('en-PK', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
    return this.transporter.sendMail({
      to,
      subject: 'Your capsule has been buried 🎁',
      text: `Your capsule "${title}" has been successfully sent to ${recipientEmail}.\n\nIt will be unlocked on: ${unlockDate}.`,
    });
  }
}
