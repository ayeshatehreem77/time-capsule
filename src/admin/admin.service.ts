import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../users/user.schema';
import { Capsule } from '../capsules/capsule.schema';
import { Model } from 'mongoose';
import { Log } from './schemas/log.schema';
import { NotificationGateway } from './admin.gateway';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Capsule.name) private capsuleModel: Model<Capsule>,
    @InjectModel(Log.name) private logModel: Model<Log>,
    private gateway: NotificationGateway
  ) { }

  // ---------------- USERS ----------------
  async getAllUsers(page = 1, limit = 20, search?: string) {
    const skip = (page - 1) * limit;

    const filter = search
      ? { email: { $regex: search, $options: 'i' } }
      : {};

    const users = await this.userModel
      .find(filter)
      .select('-password')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await this.userModel.countDocuments(filter);

    return { users, total };
  }

  // ---------------- CAPSULES ----------------
  async getAllCapsules(
    page = 1,
    limit = 20,
    status?: string,
    search?: string,
  ) {
    const skip = (page - 1) * limit;

    const filter: any = {};

    if (status) filter.status = status;

    if (search) {
      filter.title = { $regex: search, $options: 'i' };
    }

    const capsules = await this.capsuleModel
      .find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await this.capsuleModel.countDocuments(filter);

    return { capsules, total };
  }

  // ---------------- SOFT DELETE ----------------
  async softDeleteCapsule(id: string) {
    await this.capsuleModel.findByIdAndUpdate(id, {
      isDeleted: true,
      deletedAt: new Date(),
    });

    return { message: 'Capsule soft deleted' };
  }

  // ---------------- USER BLOCK ----------------
  async blockUser(id: string) {
    await this.userModel.findByIdAndUpdate(id, { isBlocked: true });

    const log = await this.logModel.create({
      message: 'User blocked',
      level: 'warning',
      userId: id,
      action: 'BLOCK_USER'
    });

    this.gateway.sendLog(log); // 🔥 yahan call karo

    return { message: 'User blocked' };
  }

  async unblockUser(id: string) {
    await this.userModel.findByIdAndUpdate(id, { isBlocked: false });
    return { message: 'User unblocked' };
  }

  // ---------------- CAPSULE STATUS ----------------
  async updateCapsuleStatus(id: string, status: string) {
    await this.capsuleModel.findByIdAndUpdate(id, { status });
    return { message: 'Capsule status updated' };
  }

  // ---------------- STATS (UPGRADED) ----------------
  async getStats() {
    const totalUsers = await this.userModel.countDocuments();
    const totalCapsules = await this.capsuleModel.countDocuments();
    const deletedCapsules = await this.capsuleModel.countDocuments({
      isDeleted: true,
    });

    const blockedUsers = await this.userModel.countDocuments({
      isBlocked: true,
    });

    const activeCapsules = await this.capsuleModel.countDocuments({
      isDeleted: false,
    });

    return {
      totalUsers,
      totalCapsules,
      deletedCapsules,
      blockedUsers,
      activeCapsules,
    };
  }

  // ---------------- LOGS (UPGRADED) ----------------
  async getLogs(range?: string, level?: string, page = 1, limit = 50) {
    const skip = (page - 1) * limit;

    let filter: any = {};

    // time filter
    if (range === '24h') {
      const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
      filter.createdAt = { $gte: last24h };
    }

    if (range === '7d') {
      const last7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      filter.createdAt = { $gte: last7d };
    }

    // level filter (info/warn/error)
    if (level) {
      filter.level = level;
    }

    const logs = await this.logModel
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);



    const total = await this.logModel.countDocuments(filter);

    return { logs, total };
  }
}