import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Capsule, CapsuleDocument } from './capsule.schema';
import { MailerService } from '../mail/mailer.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class UnlockScheduler {
  private readonly logger = new Logger(UnlockScheduler.name);

  constructor(
    
    @InjectModel(Capsule.name) private capsuleModel: Model<CapsuleDocument>,
    private mailerService: MailerService,
    private usersService: UsersService,
  ) { console.log('🔥 UnlockScheduler initialized');
}

  // runs every 5 minutes
  @Cron('*/5 * * * *')
  async handleUnlockEmails() {
    this.logger.log('⏰ Checking for capsules to unlock...');
    const now = new Date();

    const dueCapsules = await this.capsuleModel.find({
      isDeleted: false,
      notified: false,
      unlockDate: { $lte: now },
      recipientEmail: { $ne: null },
    });

    this.logger.log(`Found ${dueCapsules.length} capsules to process`);

    for (const capsule of dueCapsules) {
      try {
        this.logger.log(`Processing capsule: ${capsule._id}`);

        const sender = await this.usersService.findById(
          capsule.owner.toString(),
        );

        if (!sender) continue;

        if (capsule.recipientEmail) {

          // email receiver
          await this.mailerService.sendUnlockToReceiverEmail(
            capsule.recipientEmail,
            sender.name,
            capsule.title,
          );

          // email sender
          await this.mailerService.sendUnlockToSenderEmail(
            sender.email,
            capsule.recipientEmail,
            capsule.title,
          );

        }

        capsule.notified = true;
        capsule.notifiedAt = new Date();
        await capsule.save();
           this.logger.log(`Emails sent for capsule: ${capsule._id}`);
      } catch (err) {
        this.logger.error(
          `Failed sending unlock email for capsule ${capsule._id}`,
          err,
        );
      }
    }
  }
}