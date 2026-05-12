
import { Patch, Param, Get, Query, Delete } from '@nestjs/common';
import {
    Controller,
    Post,
    UseGuards,
    Req,
    UseInterceptors,
    UploadedFile,
    Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { CapsulesService } from './capsules.service';
import { v2 as cloudinary } from 'cloudinary';
import { ConfigService } from '@nestjs/config';
import { Readable } from 'stream';
import { CreateCapsuleDto } from './dto/create-capsule.dto';
import * as fs from 'fs';

@Controller('capsules')
export class CapsulesController {
    constructor(
        private capsulesService: CapsulesService,
        private configService: ConfigService,
    ) {
        cloudinary.config({
            cloud_name: this.configService.get('CLOUDINARY_CLOUD_NAME'),
            api_key: this.configService.get('CLOUDINARY_API_KEY'),
            api_secret: this.configService.get('CLOUDINARY_API_SECRET'),
        });
    }

    @UseGuards(AuthGuard('jwt'))
    @Post()
    @UseInterceptors(FileInterceptor('file'))
    async create(
        @UploadedFile() file: Express.Multer.File,
        @Body() createCapsuleDto: CreateCapsuleDto,
        @Req() req: any,
    ) {
        let fileUrl = '';
        let publicId = '';

        if (file) {
            const uploaded: any = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { resource_type: 'auto' },
                    (error, result) => {
                        if (result) resolve(result);
                        else reject(error);
                    },
                );

                Readable.from(file.buffer).pipe(stream);
            });

            fileUrl = uploaded.secure_url;
            publicId = uploaded.public_id;
        }

        return this.capsulesService.create(
            { ...createCapsuleDto, fileUrl, publicId },
            req.user.userId,
        );
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('my')
    getMyCapsules(@Req() req: any) {
        return this.capsulesService.getMyCapsules(req.user.userId, req.user.email);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('sent')
    getSentCapsules(@Req() req: any) {
        return this.capsulesService.getSentCapsules(req.user.userId);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('received')
    getReceivedCapsules(@Req() req: any) {
        return this.capsulesService.getReceivedCapsules(req.user.userId);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('usage')
    getUsage(@Req() req: any) {
        return this.capsulesService.getUsage(req.user.userId);
    }

    @Get('public/:publicId')
    async openPublicCapsule(
        @Param('publicId') publicId: string,
        @Query('passcode') passcode?: string,
    ) {
        return this.capsulesService.openPublic(publicId, passcode);
    }

    @UseGuards(AuthGuard('jwt'))
    @Patch(':id')
    updateCapsule(
        @Param('id') id: string,
        @Body() body: any,
        @Req() req: any,
    ) {
        return this.capsulesService.update(id, body, req.user.userId);
    }

    @UseGuards(AuthGuard('jwt'))
    @Delete(':id')
    deleteCapsule(
        @Param('id') id: string,
        @Req() req: any,
    ) {
        return this.capsulesService.delete(id, req.user.userId);
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



    @Patch(':id/seal')
    @UseGuards(AuthGuard('jwt'))
    sealCapsule(
        @Param('id') id: string,
        @Req() req,
    ) {
        return this.capsulesService.sealCapsule(id, req.user.userId);
    }



}
