import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { ResourceDocument } from 'src/app/resources/infraestructure/resources.schema';
import { TemplateDocument } from 'src/app/templates/infraestructure/template.schema';

export type SystemDocument = HydratedDocument<SystemMongoSchema>;

@Schema({ timestamps: true, versionKey: false })
export class SystemMongoSchema {
  @Prop({ type: String, required: true })
  title!: string;

  @Prop({ type: String, required: true })
  creatorId!: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'ResourceMongoSchema' }], required: true, default: [] })
  resources!: Types.ObjectId[] | ResourceDocument[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'TemplateMongoSchema' }], required: true })
  templates!: Types.ObjectId[] | TemplateDocument[];

  createdAt!: Date;
  updatedAt!: Date;
}

export const SystemSchema = SchemaFactory.createForClass(SystemMongoSchema);
