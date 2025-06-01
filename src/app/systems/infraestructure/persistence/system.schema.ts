import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type SystemDocument = HydratedDocument<SystemMongoSchema>;

@Schema({ timestamps: true, versionKey: false })
export class SystemMongoSchema {
  @Prop({ type: String, required: true })
  title!: string;

  @Prop({ type: String, required: true })
  creatorId!: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Resource' }], required: true, default: [] })
  resources!: Types.ObjectId[];

  @Prop({ type: Types.ObjectId, ref: 'Template', required: true })
  template!: Types.ObjectId;

  createdAt!: Date;
  updatedAt!: Date;
}

export const SystemSchema = SchemaFactory.createForClass(SystemMongoSchema);
