import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type TemplateDocument = HydratedDocument<TemplateMongoSchema>;

@Schema({ timestamps: true, versionKey: false })
export class TemplateMongoSchema {
  @Prop({ type: String, required: true })
  title!: string;

  createdAt!: Date;
  updatedAt!: Date;
}

export const TemplateSchema = SchemaFactory.createForClass(TemplateMongoSchema);
