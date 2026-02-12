import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

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
    @Get('protected')
    getProtected() {
        return { message: 'You accessed protected route!' };
    }
}

