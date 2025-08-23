import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { HydratedDocument } from 'mongoose';

export type ResourceItemDocument = HydratedDocument<ResourceItemMongoSchema>;

@Schema({ timestamps: true, versionKey: false })
export class ResourceItemMongoSchema {
  _id!: Types.ObjectId;

  @Prop({ type: String, required: true })
  name!: string;

  @Prop({ type: String, required: false })
  description!: string;

  @Prop({ type: [Object], required: false, default: [] })
  props!: Record<string, unknown>;

  createdAt!: Date;
  updatedAt!: Date;
}

export const ResourceItemSchema = SchemaFactory.createForClass(ResourceItemMongoSchema);
