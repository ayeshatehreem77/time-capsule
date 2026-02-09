import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { UserRole } from './user-role.enum';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Prop({ default: false })
  isVerified: boolean;

  @Prop({ type: String, default: null }) // OTP is a string
  otp: string | null;

  @Prop({ type: Date, default: null }) // OTP expiry
  otpExpiry: Date | null;
}




export const UserSchema = SchemaFactory.createForClass(User);
