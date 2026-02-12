import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Capsule, CapsuleDocument } from './capsule.schema';
import { Model } from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
import { encrypt } from '../utils/encryption';
import { decrypt } from '../utils/encryption';
import * as bcrypt from 'bcrypt';
import { CreateCapsuleDto } from './dto/create-capsule.dto'
import { DeepPartial } from 'mongoose';
import { ConfigService } from '@nestjs/config';


@Injectable()
export class CapsulesService {
    constructor(
        @InjectModel(Capsule.name)
        private capsuleModel: Model<CapsuleDocument>, private configService: ConfigService,
    ) {  console.log('ENCRYPTION_SECRET:', this.configService.get('ENCRYPTION_SECRET'));}

    async create(data: CreateCapsuleDto, userId: string, file?: Express.Multer.File): Promise<CapsuleDocument> {
        if (new Date(data.unlockDate) <= new Date()) {
            throw new BadRequestException('Unlock date must be in the future');
        }

        let fileUrl = '';
        let publicId = '';

        if (file) {
            const result = await cloudinary.uploader.upload(file.path);
            fileUrl = result.secure_url;
            publicId = result.public_id;
        }

        const { message, passcode, ...rest } = data;

        if (!message) {
            throw new BadRequestException('Message is required');
        }

        const encryptedMessage = encrypt(message);

        let hashedPasscode = undefined;

        if (passcode) {
            hashedPasscode = await bcrypt.hash(passcode, 10);
        }

        const capsuleData: DeepPartial<Capsule> = {
            title: rest.title,
            recipientEmail: rest.recipientEmail,
            unlockDate: new Date(rest.unlockDate), // convert to Date
            message: encryptedMessage,
            passcode: hashedPasscode,
            owner: userId as any, // Typescript expects ObjectId, not string
            fileUrl,
            publicId,
        };

        const capsule = await this.capsuleModel.create(capsuleData);


        return capsule;
    }



    async open(id: string, userId: string, passcode?: string) {
        const capsule = await this.capsuleModel.findOne({
            _id: id,
            isDeleted: false,
        });


        if (!capsule) {
            throw new BadRequestException('Capsule not found');
        }

        // Only owner can open (for now)
        if (capsule.owner.toString() !== userId) {
            throw new BadRequestException('Not authorized');
        }

        const now = new Date();

        if (now < capsule.unlockDate) {
            const timeLeft =
                capsule.unlockDate.getTime() - now.getTime();

            const days = Math.ceil(timeLeft / (1000 * 60 * 60 * 24));

            return {
                message: `Capsule locked. ${days} days remaining.`,
            };
        }

        // If passcode exists, verify it
        if (capsule.passcode) {
            if (!passcode) {
                throw new BadRequestException('Passcode required');
            }

            const isMatch = await bcrypt.compare(passcode, capsule.passcode);

            if (!passcode || !isMatch) {
                throw new BadRequestException('Invalid passcode');
            }
        }

        if (!capsule.message) {
            throw new BadRequestException('No message found');
        }

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

    async getMyCapsules(userId: string) {
        const capsules = await this.capsuleModel.find({
            owner: userId,
            isDeleted: false,
        });

        const now = new Date();

        return capsules.map((capsule) => {
            const locked = now < capsule.unlockDate;

            let daysRemaining = 0;

            if (locked) {
                const timeLeft =
                    capsule.unlockDate.getTime() - now.getTime();

                daysRemaining = Math.ceil(
                    timeLeft / (1000 * 60 * 60 * 24),
                );
            }

            return {
                id: capsule._id,
                title: capsule.title,
                unlockDate: capsule.unlockDate,
                isOpened: capsule.isOpened,
                locked,
                daysRemaining,
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

        if (capsule.isOpened) {
            throw new BadRequestException('Cannot edit opened capsule');
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

        if (capsule.isOpened) {
            throw new BadRequestException('Cannot delete opened capsule');
        }

        await this.capsuleModel.findByIdAndUpdate(id, {
            isDeleted: true,
            deletedAt: new Date(),
        });


        return {
            message: 'Capsule deleted successfully',
        };
    }




}
