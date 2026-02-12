import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { CapsulesService } from './capsules.service';
import { AuthGuard } from '@nestjs/passport';
import { Param, Get, Query } from '@nestjs/common';

@Controller('capsules')
export class CapsulesController {
    constructor(private capsulesService: CapsulesService) { }

    @UseGuards(AuthGuard('jwt'))
    @Post()
    create(@Body() body: any, @Req() req: any) {
        return this.capsulesService.create(body, req.user.userId);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get(':id')
    openCapsule(
        @Param('id') id: string,
        @Query('passcode') passcode: string,
        @Req() req: any,
    ) {
        return this.capsulesService.open(id, req.user.userId, passcode);
    }
}
