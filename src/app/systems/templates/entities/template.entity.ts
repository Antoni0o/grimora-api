import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import Field from '../../fields/entities/field.entity';

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
        fields: [{ type: Types.ObjectId, ref: 'Field' }],
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
