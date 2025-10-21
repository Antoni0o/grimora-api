import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { ResourceItemMongoSchema, ResourceItemSchema } from './resource-item.schema';

export type ResourceDocument = HydratedDocument<ResourceMongoSchema>;

@Schema({ timestamps: true, versionKey: false })
export class ResourceMongoSchema {
  @Prop({ type: String, required: true })
  title!: string;

  @Prop({ type: [ResourceItemSchema], required: true, default: [] })
  items?: ResourceItemMongoSchema[];

  createdAt!: Date;
  updatedAt!: Date;
}

export const ResourceSchema = SchemaFactory.createForClass(ResourceMongoSchema);
