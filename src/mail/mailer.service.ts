import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class MailerService {
  private resend: Resend;

  constructor(private config: ConfigService) {
    this.resend = new Resend(
      this.config.get<string>('RESEND_API_KEY'),
    );
  }

  private async sendEmail(
    to: string,
    subject: string,
    text: string,
  ) {
    try {
      const response = await this.resend.emails.send({
        from: 'onboarding@resend.dev',
        to,
        subject,
        text,
      });

      console.log('✅ Email sent:', response);
      return response;
    } catch (error) {
      console.error('❌ Email delivery failed:', error);
      throw error;
    }
  }

  async sendCapsuleSentEmail(
    to: string,
    capsuleTitle: string,
    recipient: string,
  ) {
    return this.sendEmail(
      to,
      'Capsule Sent Successfully 📬',
      `Your capsule "${capsuleTitle}" has been sent to ${recipient}.`,
    );
  }

  async sendCapsuleReceivedEmail(
    to: string,
    senderName: string,
    capsuleTitle: string,
  ) {
    return this.sendEmail(
      to,
      'You received a TimeCapsule 🎁',
      `${senderName} has sent you a capsule titled "${capsuleTitle}". It will unlock on the scheduled date.`,
    );
  }

  async sendUnlockToReceiverEmail(
    to: string,
    senderName: string,
    title: string,
  ) {
    return this.sendEmail(
      to,
      'Your capsule is unlocked ⏳',
      `The capsule "${title}" sent by ${senderName} is now unlocked.`,
    );
  }

  async sendUnlockToSenderEmail(
    to: string,
    recipientEmail: string,
    title: string,
  ) {
    return this.sendEmail(
      to,
      'Capsule Unlocked 🎉',
      `The capsule "${title}" you sent to ${recipientEmail} is now unlocked.`,
    );
  }

  async sendBurialToReceiverEmail(
    to: string,
    senderName: string,
    title: string,
    unlockDate: Date,
  ) {
    const formattedDate = new Date(unlockDate).toLocaleString('en-PK', {
  timeZone: 'Asia/Karachi',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
});

    return this.sendEmail(
      to,
      'A secret has been buried for you ⏳',
      `${senderName} has buried a secret capsule for you.\n\nTitle: ${title}\nIt will be revealed on: ${formattedDate}\n\nStay tuned...`,
    );
  }

  async sendBurialToSenderEmail(
    to: string,
    recipientEmail: string,
    title: string,
    unlockDate: Date,
  ) {
    const formattedDate = new Date(unlockDate).toLocaleString('en-PK', {
  timeZone: 'Asia/Karachi',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
});

    return this.sendEmail(
      to,
      'Your capsule has been buried 🎁',
      `Your capsule "${title}" has been successfully sent to ${recipientEmail}.\n\nIt will be unlocked on: ${formattedDate}.`,
    );
  }
}
