import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Capsule, CapsuleDocument } from './capsule.schema';
import { Model } from 'mongoose';

@Injectable()
export class CapsulesService {
    constructor(
        @InjectModel(Capsule.name)
        private capsuleModel: Model<CapsuleDocument>,
    ) { }

    async create(data: any, userId: string) {
        if (new Date(data.unlockDate) <= new Date()) {
            throw new BadRequestException('Unlock date must be in the future');
        }

        const capsule = await this.capsuleModel.create({
            ...data,
            owner: userId,
        });

        return capsule;
    }

    async open(id: string, userId: string, passcode?: string) {
        const capsule = await this.capsuleModel.findById(id);

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

        capsule.isOpened = true;
        await capsule.save();

        return capsule;
    }

    async getMyCapsules(userId: string) {
        const capsules = await this.capsuleModel.find({
            owner: userId,
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
        const capsule = await this.capsuleModel.findById(id);

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



}
