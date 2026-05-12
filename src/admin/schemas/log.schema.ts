// schemas/log.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Log extends Document {
  @Prop()
  message!: string;

  @Prop()
  level!: string; // 'info', 'error', 'warning'

  @Prop()
  userId!: string;

  @Prop()
  action!: string; // 'LOGIN', 'BLOCK_USER', 'CREATE_CAPSULE'
}

export const LogSchema = SchemaFactory.createForClass(Log);