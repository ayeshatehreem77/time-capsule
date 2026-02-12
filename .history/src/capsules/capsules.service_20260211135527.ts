import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Capsule, CapsuleDocument } from './capsule.schema';
import { Model } from 'mongoose';

@Injectable()
export class CapsulesService {
  constructor(
    @InjectModel(Capsule.name)
    private capsuleModel: Model<CapsuleDocument>,
  ) {}

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
}
