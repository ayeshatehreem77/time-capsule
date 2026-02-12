import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type CapsuleDocument = HydratedDocument<Capsule>;

@Schema({ timestamps: true })
export class Capsule {

  @Prop({ required: true })
  title: string;

  @Prop()
  message: string;

  @Prop()
  fileUrl: string;

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

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop()
  deletedAt?: Date;

  @Prop()
  publicId: string;
}

export const CapsuleSchema = SchemaFactory.createForClass(Capsule);
