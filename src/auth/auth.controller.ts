import { Controller, Post, Body, Put, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from "./jwt-auth.guard";

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('register')
    register(@Body() body: any) {
        return this.authService.register(
            body.name,
            body.email,
            body.password,
        );
    }

    @Post('login')
    login(@Body() body: any) {
        return this.authService.login(body.email, body.password);
    }

    @Post('verify-otp')
    verifyOtp(@Body() body: any) {
        return this.authService.verifyOtp(body.email, body.otp);
    }

    @UseGuards(AuthGuard('jwt')) 
    @Put('update-avatar')
    async updateAvatar(@Req() req, @Body('avatarUrl') avatarUrl: string) {
        return this.authService.updateProfilePic(req.user.userId, avatarUrl);
    }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    getProfile(@Req() req) {
        return this.authService.getProfile(req.user.userId);
    }

    @UseGuards(JwtAuthGuard)
    @Put('update')
    updateProfile(@Req() req, @Body() body) {
        return this.authService.updateProfile(req.user.userId, body);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('protected')
    getProtected() {
        return { message: 'You accessed protected route!' };
    }
}

