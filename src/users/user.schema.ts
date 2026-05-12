import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { UserRole } from './user-role.enum';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  name!: string;

  @Prop({ default: 'https://api.dicebear.com/7.x/bottts/svg?seed=default' })
  profilePic!: string;

  @Prop({ required: true, unique: true })
  email!: string;

  @Prop({ required: true })
  password!: string;

  @Prop({ default: 'user', enum: ['user', 'admin'] })
  role!: string;

  @Prop({ default: false })
  isVerified!: boolean;

  @Prop({ type: String, default: null }) // OTP is a string
  otp!: string | null;

  @Prop({ type: Date, default: null }) // OTP expiry
  otpExpiry!: Date | null;

  @Prop({ default: false })
  isBlocked!: boolean;

  @Prop({ default: 'starter' })
  plan!: string;

  @Prop({ type: Date, default: null })
  planExpiresAt!: Date | null;




}





export const UserSchema = SchemaFactory.createForClass(User);
