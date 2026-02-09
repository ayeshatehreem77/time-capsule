import { Injectable, BadRequestException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { generateOTP } from './otp.util';
import { mailer } from '../utils/mailer';

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
            otpExpiry: new Date(Date.now() + 5 * 60 * 1000),
        });

        await mailer.sendMail({
            to: email,
            subject: 'Verify your TimeCapsule account',
            text: `Your OTP is ${otp}. It expires in 5 minutes.`,
        });

        return { message: 'OTP sent to email' };
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
