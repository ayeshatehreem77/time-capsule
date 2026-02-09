import { Injectable, BadRequestException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as nodemailer from 'nodemailer';
import { mailer } from '../utils/mailer';
import { generateOTP } from './otp.util';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) { }

    async register(name: string, email: string, password: string) {
        const existingUser = await this.usersService.findByEmail(email);
        if (existingUser) {
            throw new BadRequestException('Email already exists');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const otp = generateOTP();

        const user = await this.usersService.create({
            name,
            email,
            password: hashedPassword,
            otp,
            otpExpiry: new Date(Date.now() + 5 * 60 * 1000), // 5 min expiry
            isVerified: false,
        });

        await mailer.sendMail({
            from: `"TimeCapsule" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Verify your TimeCapsule account',
            text: `Your OTP is ${otp}. It expires in 5 minutes.`,
        });

        return { message: 'OTP sent! Check the preview URL in console.' };
    }

    async verifyOtp(email: string, otp: string) {
        const user = await this.usersService.findByEmail(email);
        if (!user) throw new BadRequestException('User not found');

        if (
            !user.otp ||
            !user.otpExpiry ||
            user.otp !== otp ||
            user.otpExpiry.getTime() < Date.now()
        ) {
            throw new BadRequestException('Invalid or expired OTP');
        }


        user.isVerified = true;
        user.otp = null;
        user.otpExpiry = null;
        await user.save();

        return { message: 'Account verified successfully' };
    }


    async login(email: string, password: string) {
        const user = await this.usersService.findByEmail(email);
        if (!user) throw new BadRequestException('Invalid credentials');

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) throw new BadRequestException('Invalid credentials');

        const payload = { sub: user._id, role: user.role };
        const token = this.jwtService.sign(payload);

        return { accessToken: token };
    }
}
