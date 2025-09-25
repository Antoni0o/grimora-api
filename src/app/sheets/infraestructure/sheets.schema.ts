import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { TemplateDocument } from 'src/app/templates/infraestructure/template.schema';

export type SheetDocument = HydratedDocument<SheetMongoSchema>;

@Schema({ timestamps: true, versionKey: false })
export class SheetMongoSchema {
  @Prop({ required: true })
  title!: string;

  @Prop({ required: true })
  ownerId!: string;

  @Prop({ type: Types.ObjectId, ref: 'TemplateMongoSchema', required: true })
  template!: Types.ObjectId | TemplateDocument;

  @Prop({ type: Object, required: true })
  values!: Record<string, unknown>;

  createdAt!: Date;
  updatedAt!: Date;
}

export const SheetSchema = SchemaFactory.createForClass(SheetMongoSchema);
