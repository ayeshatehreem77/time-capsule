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

}
