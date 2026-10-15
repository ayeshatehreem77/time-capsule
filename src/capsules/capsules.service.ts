import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Capsule, CapsuleDocument } from './capsule.schema';
import { Model } from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
import { encrypt } from '../utils/encryption';
import { decrypt } from '../utils/encryption';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { CreateCapsuleDto } from './dto/create-capsule.dto'
import { DeepPartial } from 'mongoose';
import { nanoid } from 'nanoid';
import { MailerService } from '../mail/mailer.service';
import { NotificationGateway } from '../admin/admin.gateway'
import { User } from '../users/user.schema';



@Injectable()
export class CapsulesService {
    constructor(
        @InjectModel(Capsule.name)
        private capsuleModel: Model<CapsuleDocument>,
        private mailerService: MailerService,
        private usersService: UsersService,
        private gateway: NotificationGateway,
        @InjectModel(User.name)
        private userModel: Model<User>,
    ) { }

    async create(data: any, userId: string): Promise<any> {
 
  const user = await this.usersService.findById(userId);

  if (!user) {
    throw new BadRequestException('User not found');
  }

  if (
    user.plan !== 'starter' &&
    user.planExpiresAt &&
    user.planExpiresAt < new Date()
  ) {
    user.plan = 'starter';
    user.planExpiresAt = null;

    await user.save();

    console.log('🔄 USER DOWNGRADED TO STARTER');
  }

  if (!data.unlockDate) {
    throw new BadRequestException('Unlock date is required');
  }

  if (new Date(data.unlockDate) <= new Date()) {
    throw new BadRequestException(
      'Unlock date must be in the future',
    );
  }

  if (!data.message?.trim()) {
    throw new BadRequestException('Message is required');
  }

  if (user.plan === 'starter') {
    const capsuleCount =
      await this.capsuleModel.countDocuments({
        owner: userId,
        isDeleted: false,
      });

    if (capsuleCount >= 5) {
      throw new BadRequestException(
        'Starter plan allows only 5 capsules',
      );
    }
  }

  const {
    message,
    passcode,
    fileUrl,
    recipientEmail,
    ...rest
  } = data;

  const encryptedMessage = encrypt(message);

  let hashedPasscode: string | undefined;

  if (passcode) {
    hashedPasscode = await bcrypt.hash(passcode, 10);
  }

  const cleanedRecipient =
    recipientEmail?.trim() || null;

  const generatedPublicId = nanoid(10);

  const isSealed = data.isSealed ?? false;

  const capsule = await this.capsuleModel.create({
    title: rest.title,
    recipientEmail: cleanedRecipient,
    unlockDate: new Date(data.unlockDate),
    message: encryptedMessage,
    passcode: hashedPasscode,
    owner: userId,
    fileUrl: fileUrl || '',
    publicId: generatedPublicId,

    deliveryType: cleanedRecipient
      ? 'sent'
      : 'self',

    deliveryStatus: cleanedRecipient
      ? 'pending'
      : 'delivered',

    isSealed,
  });

  if (isSealed && cleanedRecipient) {
    try {
      await Promise.all([
        this.mailerService.sendBurialToReceiverEmail(
          cleanedRecipient,
          user.name,
          capsule.title,
          capsule.unlockDate,
            capsule.passcode,
        ),

        this.mailerService.sendBurialToSenderEmail(
          user.email,
          cleanedRecipient,
          capsule.title,
          capsule.unlockDate,
        ),
      ]);
    } catch (error) {
      console.error(
        '📧 Email delivery failed:',
        error,
      );
    }
  }

  try {
    if (cleanedRecipient) {
      this.gateway.sendNotification(userId, {
        type: 'CAPSULE_SENT',
        message: `Capsule "${capsule.title}" sent successfully`,
      });
    }
  } catch (error) {
    console.error(
      '🔔 Notification failed:',
      error,
    );
  }

  return {
    success: true,

    message: 'Capsule created successfully',

    capsule,

    publicLink: `${process.env.BACKEND_URL}/capsules/public/${generatedPublicId}`,
  };
}




    async open(id: string, userId: string, passcode?: string) {
        // 1. Fetch Capsule
        const capsule = await this.capsuleModel.findOne({
            _id: id,
            isDeleted: false,
        });

        if (!capsule) throw new BadRequestException('Capsule not found');
        if (!capsule.isSealed) throw new BadRequestException('Capsule is still in draft mode');

        // 2. Fetch User and Sender Information
        const user = await this.usersService.findById(userId);
        if (!user) throw new BadRequestException('User not found');

        // Owner ki details fetch karein taake frontend par name dikha sakein
        const ownerDetails = await this.usersService.findById(capsule.owner.toString());

        // 3. Authorization Check
        const isOwner = capsule.owner.toString() === userId;
        const isRecipient =
            !!capsule.recipientEmail &&
            capsule.recipientEmail.toLowerCase() === user.email.toLowerCase();

        if (!isOwner && !isRecipient) throw new BadRequestException('Not authorized');

        // 4. Lock Date Check
        const now = new Date();
        if (now < capsule.unlockDate) {
            const timeLeft = capsule.unlockDate.getTime() - now.getTime();
            const days = Math.ceil(timeLeft / (1000 * 60 * 60 * 24));
            return { message: `Capsule locked. ${days} days remaining.`, isLocked: true };
        }

        // 5. Passcode Verification
        if (capsule.passcode) {
            if (!passcode) throw new BadRequestException('Passcode required');
            const isMatch = await bcrypt.compare(passcode, capsule.passcode);
            if (!isMatch) throw new BadRequestException('Invalid passcode');
        }


        // 6. Decryption
        let originalMessage = '';
        try {
            originalMessage = decrypt(capsule.message);
        } catch {
            throw new BadRequestException('Message decryption failed');
        }

        // 7. Update Status
        capsule.isOpened = true;
        if (capsule.deliveryType === 'sent' && capsule.deliveryStatus === 'pending') {
            capsule.deliveryStatus = 'delivered';
        }
        await capsule.save();

        this.gateway.sendNotification(capsule.owner.toString(), {
            type: 'CAPSULE_OPENED',
            message: 'Your capsule was opened',
        });

        // 8. FINAL RETURN (Matching your Frontend Modal Fields)
        return {
            title: capsule.title,
            message: originalMessage,
            fileUrl: capsule.fileUrl,
            senderName: ownerDetails ? ownerDetails.name : "Unknown Pilot", // Field 1
            createdDate: capsule.createdAt, // Field 2
            id: capsule._id
        };
    }

    async getMyCapsules(userId: string, userEmail: string) {
        const capsules = await this.capsuleModel.find({
            isDeleted: false,
            $or: [
                { owner: userId },
                { recipientEmail: userEmail }
            ],
        });

        const now = new Date();

        return capsules.map((capsule) => {
            const locked = now < capsule.unlockDate;
            let daysRemaining = 0;

            if (locked) {
                const timeLeft = capsule.unlockDate.getTime() - now.getTime();
                daysRemaining = Math.ceil(timeLeft / (1000 * 60 * 60 * 24));
            }

            // --- Dynamic Status Logic ---
            let status = "PENDING";
            if (capsule.isOpened) {
                status = "OPENED";
            } else if (!locked) {
                status = "DELIVERED";
            }

            return {
                id: capsule._id,
                title: capsule.title,
                unlockDate: capsule.unlockDate,
                isOpened: capsule.isOpened,
                locked,
                daysRemaining,
                status,
                hasFile: !!capsule.fileUrl,
            };
        });
    }

    async update(id: string, data: any, userId: string) {
        const capsule = await this.capsuleModel.findOne({
            _id: id,
            isDeleted: false,
        });

        if (!capsule) {
            throw new BadRequestException('Capsule not found');
        }

        if (capsule.owner.toString() !== userId) {
            throw new BadRequestException('Not authorized');
        }

        if (capsule.isSealed) {
            throw new BadRequestException('Capsule is sealed and cannot be edited');
        }

        if (data.unlockDate && new Date(data.unlockDate) <= new Date()) {
            throw new BadRequestException('Unlock date must be in future');
        }

        Object.assign(capsule, data);

        await capsule.save();

        return {
            message: 'Capsule updated successfully',
            capsule,
        };
    }

    async delete(id: string, userId: string) {
        const capsule = await this.capsuleModel.findOne({ _id: id, isDeleted: false });

        if (!capsule) throw new BadRequestException('Capsule not found');
        if (capsule.owner.toString() !== userId) throw new BadRequestException('Not authorized');
        if (capsule.isOpened) throw new BadRequestException('Cannot delete opened capsule');

        if (capsule.publicId) {
            try {
                await cloudinary.uploader.destroy(capsule.publicId, { resource_type: 'auto' });
            } catch (e) {
                console.error('Cloudinary delete failed:', e);
            }
        }

        capsule.isDeleted = true;
        capsule.deletedAt = new Date();
        await capsule.save();

        return { message: 'Capsule deleted successfully' };
    }

    async getSentCapsules(userId: string) {
        const capsules = await this.capsuleModel.find({
            owner: userId,
            deliveryType: 'sent',
            isDeleted: false,
        });

        const now = new Date();

        return capsules.map((capsule) => {
            const locked = now < capsule.unlockDate;

            let daysRemaining = 0;

            if (locked) {
                const timeLeft = capsule.unlockDate.getTime() - now.getTime();
                daysRemaining = Math.ceil(timeLeft / (1000 * 60 * 60 * 24));
            }

            return {
                id: capsule._id,
                title: capsule.title,
                recipientEmail: capsule.recipientEmail,
                unlockDate: capsule.unlockDate,
                createdAt: capsule.createdAt,
                deliveryStatus: capsule.deliveryStatus,
                locked,
                daysRemaining,
                hasFile: !!capsule.fileUrl,
            };
        });
    }

    async getReceivedCapsules(userId: string) {
        const user = await this.usersService.findById(userId);

        if (!user) {
            throw new BadRequestException('User not found');
        }

        const capsules = await this.capsuleModel.find({
            recipientEmail: user.email,
            isDeleted: false,
        });

        const now = new Date();

        const results: any[] = [];

        for (const capsule of capsules) {
            const sender = await this.usersService.findById(
                capsule.owner.toString(),
            );

            const locked = now < capsule.unlockDate;

            let daysRemaining = 0;

            if (locked) {
                const timeLeft = capsule.unlockDate.getTime() - now.getTime();
                daysRemaining = Math.ceil(timeLeft / (1000 * 60 * 60 * 24));
            }

            if (capsule.deliveryStatus === 'pending') {
                capsule.deliveryStatus = 'delivered';
                await capsule.save();

                this.gateway.sendNotification(userId, {
                    type: 'CAPSULE_DELIVERED',
                    message: 'You have received a capsule',
                });
            }

            results.push({
                id: capsule._id,
                title: capsule.title,
                senderName: sender?.name || 'Unknown',
                senderEmail: sender?.email || 'Unknown',
                unlockDate: capsule.unlockDate,
                deliveryStatus: capsule.deliveryStatus,
                locked,
                daysRemaining,
                hasFile: !!capsule.fileUrl,
            });
        }

        return results;
    }

    async openPublic(publicId: string, passcode?: string) {
        const capsule = await this.capsuleModel.findOne({
            publicId,
            isDeleted: false,
        });

        if (!capsule) {
            throw new BadRequestException('Capsule not found');
        }

        const now = new Date();

        // ⏳ Locked
        if (now < capsule.unlockDate) {
            const timeLeft =
                capsule.unlockDate.getTime() - now.getTime();

            const days = Math.ceil(timeLeft / (1000 * 60 * 60 * 24));

            return {
                message: `Capsule locked. ${days} days remaining.`,
            };
        }

        // 🔐 Passcode check
        if (capsule.passcode) {
            if (!passcode) {
                throw new BadRequestException('Passcode required');
            }

            const isMatch = await bcrypt.compare(passcode, capsule.passcode);

            if (!isMatch) {
                throw new BadRequestException('Invalid passcode');
            }
        }

        // 🔓 Decrypt message
        let originalMessage = '';

        try {
            originalMessage = decrypt(capsule.message);
        } catch {
            throw new BadRequestException('Message decryption failed');
        }

        const capsuleObj = capsule.toObject();
        capsuleObj.message = originalMessage;

        return capsuleObj;
    }

    async sealCapsule(id: string, userId: string) {
        const capsule = await this.capsuleModel.findById(id);

        if (!capsule || capsule.isDeleted) {
            throw new BadRequestException('Capsule not found');
        }

        if (capsule.owner.toString() !== userId) {
            throw new BadRequestException('Not authorized');
        }

        if (capsule.isSealed) {
            throw new BadRequestException('Capsule already sealed');
        }

        capsule.isSealed = true;
        await capsule.save();

        // 🔥 send emails NOW
        if (capsule.recipientEmail) {
            const sender = await this.usersService.findById(userId);

            if (sender) {
                await this.mailerService.sendBurialToReceiverEmail(
                    capsule.recipientEmail,
                    sender.name,
                    capsule.title,
                    capsule.unlockDate,
                    capsule.passcode,
                );

                await this.mailerService.sendBurialToSenderEmail(
                    sender.email,
                    capsule.recipientEmail,
                    capsule.title,
                    capsule.unlockDate,
                );
            }
        }

        return {
            message: 'Capsule sealed successfully',
            capsule,
        };
    }

    async getUsage(userId: string) {
        const user = await this.userModel.findById(userId);

        const count = await this.capsuleModel.countDocuments({
            owner: userId,
        });

        return {
            used: count,
            limit: user?.plan === "starter" ? 5 : null,
        };
    }

}
