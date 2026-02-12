import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Capsule, CapsuleDocument } from './capsule.schema';
import { Model } from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
import { encrypt } from '../utils/encryption';
import { decrypt } from '../utils/encryption';


@Injectable()
export class CapsulesService {
    constructor(
        @InjectModel(Capsule.name)
        private capsuleModel: Model<CapsuleDocument>,
    ) { }

    async create(data: any, userId: string, file?: Express.Multer.File) {
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

        const { message, ...rest } = data;

        const encryptedMessage = encrypt(message);

        const capsule = await this.capsuleModel.create({
            ...rest,
            message: encryptedMessage,
            owner: userId,
            fileUrl,
            publicId,
        });


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
            if (!passcode || passcode !== capsule.passcode) {
                throw new BadRequestException('Invalid passcode');
            }
        }

        const originalMessage = decrypt(capsule.message);

        capsule.isOpened = true;
        await capsule.save();

        return {
            ...capsule.toObject(),
            message: originalMessage,
        };
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
