import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CapsuleDocument = Capsule & Document;

@Schema({ timestamps: true })
export class Capsule {

  @Prop({ required: true })
  title: string;

  @Prop()
  message: string;

  @Prop()
  fileUrl: string; // image or video link (Cloudinary later)

  @Prop({ required: true })
  unlockDate: Date;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  owner: Types.ObjectId;

  @Prop()
  recipientEmail: string;

  @Prop({ default: false })
  isOpened: boolean;

  @Prop()
  passcode: string;
}

export const CapsuleSchema = SchemaFactory.createForClass(Capsule);
