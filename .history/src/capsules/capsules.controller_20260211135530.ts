import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { CapsulesService } from './capsules.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('capsules')
export class CapsulesController {
  constructor(private capsulesService: CapsulesService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(@Body() body: any, @Req() req: any) {
    return this.capsulesService.create(body, req.user.userId);
  }
}
