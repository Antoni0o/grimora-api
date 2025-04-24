import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import Field, { FieldSchema } from '../../fields/entities/field.entity';

export type TemplateDocument = HydratedDocument<Template>;

@Schema()
export default class Template {
  @Prop({ type: String, required: true })
  public name!: string;

  @Prop({
    type: [
      raw({
        name: { type: String, required: true },
        order: { type: Number, required: true },
        fields: { type: [FieldSchema] },
      }),
    ],
  })
  public sections!: Array<{
    name: string;
    order: number;
    fields: Field[];
  }>;
}

export const TemplateSchema = SchemaFactory.createForClass(Template);
