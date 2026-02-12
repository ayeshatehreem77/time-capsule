// import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
// import { CapsulesService } from './capsules.service';
// import { AuthGuard } from '@nestjs/passport';
import { Param, Get, Query } from '@nestjs/common';
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

@Controller('capsules')
export class CapsulesController {
  constructor(private capsulesService: CapsulesService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
    @Req() req: any,
  ) {
    let fileUrl = '';

    if (file) {
      const uploaded = await cloudinary.uploader.upload(file.path, {
        resource_type: 'auto', // important for video support
      });

      fileUrl = uploaded.secure_url;
    }

    return this.capsulesService.create(
      { ...body, fileUrl },
      req.user.userId,
    );
  }
}
