import { Injectable, BadRequestException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as nodemailer from 'nodemailer';
import { createMailer } from '../utils/mailer';
import { generateOTP } from './otp.util';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../users/user.schema';
import { NotFoundException } from '@nestjs/common';
import { Log } from '../admin/schemas/log.schema';


@Injectable()
export class AuthService {
    constructor(
        @InjectModel(Log.name) private logModel: Model<Log>,
        private usersService: UsersService,
        private jwtService: JwtService,
        private configService: ConfigService,
        @InjectModel(User.name)
        private userModel: Model<UserDocument>,
    ) { }

    async register(name: string, email: string, password: string) {
        const existingUser = await this.usersService.findByEmail(email);
        if (existingUser) {
            if (existingUser.isVerified) {
                throw new BadRequestException('Email already exists');
            }

            // update OTP for unverified user
            const otp = generateOTP();

            existingUser.otp = otp;
            existingUser.otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

            await existingUser.save();

            const mailer = createMailer(this.configService);

            await mailer.sendMail({
                from: `"TimeCapsule" <${this.configService.get('EMAIL_USER')}>`,
                to: email,
                subject: 'Verify your TimeCapsule account',
                text: `Your OTP is ${otp}. It expires in 5 minutes.`,
            });

            return {
                message: 'OTP resent',
                user: {
                    id: existingUser._id,
                    email: existingUser.email,
                },
            };
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

        // try {
        //     const mailer = createMailer(this.configService);

        //     await mailer.sendMail({
        //         from: `"TimeCapsule" <${this.configService.get('EMAIL_USER')}>`,
        //         to: email,
        //         subject: 'Verify your TimeCapsule account',
        //         text: `Your OTP is ${otp}. It expires in 5 minutes.`,
        //     });
        // } catch (err) {
        //     console.log("MAIL ERROR:", err);
        // }




        return {
            message: 'OTP sent! Check the preview URL in console.',
            user: {
                id: user._id,
                email: user.email
            }
        };
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

        if (user.isBlocked) {
            throw new BadRequestException('Your account has been suspended. Please contact admin.');
        }

        if (!user.isVerified) {
            throw new BadRequestException('Please verify your email first');
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) throw new BadRequestException('Invalid credentials');

        const payload = { sub: user._id, role: user.role };
        console.log("JWT SECRET:", process.env.JWT_SECRET);
        const token = this.jwtService.sign(payload);

        await this.logModel.create({
            message: `User ${user.email} logged in successfully`,
            level: 'info',
            userId: user._id.toString(),
            action: 'LOGIN'
        });

        return {
            accessToken: token,
            user: {
                id: user._id,
                email: user.email,
                role: user.role
            }
        };
    }

    async getProfile(userId: string) {
        return this.userModel.findById(userId).select('-password');
    }

    async updateProfile(userId: string, data: any) {
        const user = await this.userModel.findById(userId);

        if (!user) {
            throw new BadRequestException('User not found');
        }

        // 🔐 prevent empty updates
        if (!data.name && !data.email) {
            throw new BadRequestException('Nothing to update');
        }

        // 📧 check email uniqueness
        if (data.email && data.email !== user.email) {
            const existing = await this.userModel.findOne({ email: data.email });

            if (existing) {
                throw new BadRequestException('Email already in use');
            }

            user.email = data.email;
        }

        // 👤 update name
        if (data.name) {
            user.name = data.name;
        }

        await user.save();

        // ❗ never return password
        const { password, ...safeUser } = user.toObject();
        return safeUser;
    }

    // auth.service.ts

    async updateProfilePic(userId: string, avatarUrl: string) {
        const updatedUser = await this.userModel.findByIdAndUpdate(
            userId,
            { profilePic: avatarUrl },
            { new: true } // Taake updated user wapas milay
        );

        if (!updatedUser) {
            throw new NotFoundException('User not found');
        }

        return updatedUser;
    }

    async downgradePlan(userId: string) {

        await this.userModel.findByIdAndUpdate(
            userId,
            {
                plan: 'starter',
            },
        );

        return {
            message: 'Plan downgraded',
        };
    }

}
