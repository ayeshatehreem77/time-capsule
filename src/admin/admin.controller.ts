import {
  Controller,
  Get,
  Delete,
  Param,
  Patch,
  UseGuards,
  Query,
  Body,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { AuthGuard } from '@nestjs/passport';
import { AdminGuard } from './admin.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@UseGuards(AuthGuard('jwt'), AdminGuard)
@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) { }

  // USERS (pagination)
  @Get('users')
  getUsers(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('search') search?: string,
  ) {
    return this.adminService.getAllUsers(+page, +limit, search);
  }

  // CAPSULES (pagination + filters)
  @Get('capsules')
  getCapsules(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.adminService.getAllCapsules(+page, +limit, status, search);
  }

  @Get('stats')
  getStats() {
    return this.adminService.getStats();
  }

  @Get('logs')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  getLogs(
    @Query('range') range?: string,
    @Query('level') level?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 50,
  ) {
    return this.adminService.getLogs(range, level, +page, +limit);
  }

  @Delete('capsules/:id')
  deleteCapsule(@Param('id') id: string) {
    return this.adminService.softDeleteCapsule(id);
  }

  @Patch('users/:id/block')
  blockUser(@Param('id') id: string) {
    return this.adminService.blockUser(id);
  }

  @Patch('users/:id/unblock')
  unblockUser(@Param('id') id: string) {
    return this.adminService.unblockUser(id);
  }

  // Capsule status update (IMPORTANT)
  @Patch('capsules/:id/status')
  updateCapsuleStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.adminService.updateCapsuleStatus(id, status);
  }
}