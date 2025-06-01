import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ResourceDocument = HydratedDocument<ResourceMongoSchema>;

@Schema({ timestamps: true, versionKey: false })
export class ResourceMongoSchema {
  @Prop({ type: String, required: true })
  title!: string;

  createdAt!: Date;
  updatedAt!: Date;
}

export const ResourceSchema = SchemaFactory.createForClass(ResourceMongoSchema);
