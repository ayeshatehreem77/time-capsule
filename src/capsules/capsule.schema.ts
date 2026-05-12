import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsOptional } from 'class-validator';
import { HydratedDocument, Types } from 'mongoose';

export type CapsuleDocument = HydratedDocument<Capsule>;

@Schema({ timestamps: true })
export class Capsule {

  @Prop({ required: true })
  title!: string;

  @Prop()
  message!: string;

  @Prop()
  fileUrl!: string;

  @Prop()
  createdAt?: Date;

  @Prop({ required: true })
  unlockDate!: Date;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  owner!: Types.ObjectId;

  @Prop({ type: String, default: null })
  recipientEmail?: string | null;

  @Prop({ type: String, default: 'self', enum: ['self', 'sent'] })
  deliveryType!: string;

  @Prop({ type: String, default: 'pending', enum: ['pending', 'delivered'] })
  deliveryStatus!: string;

  @Prop({ default: false })
  isOpened!: boolean;

  @Prop()
  passcode!: string;

  @Prop({ default: false })
  isDeleted!: boolean;

  @Prop()
  deletedAt?: Date;

  @Prop()
  @IsOptional()
  publicId!: string;

  @Prop({ default: false })
  notified!: boolean;

  @Prop()
  notifiedAt?: Date;

  @Prop({ default: true })
  isSealed!: boolean;
}

export const CapsuleSchema = SchemaFactory.createForClass(Capsule);
